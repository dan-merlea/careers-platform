import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobBoard, JobBoardDocument } from './schemas/job-board.schema';
import { CreateJobBoardDto } from './dto/create-job-board.dto';
import { UpdateJobBoardDto } from './dto/update-job-board.dto';
import { Job, JobDocument } from '../job/job.entity';
import { ApiKey, ApiKeyDocument } from '../api-keys/api-keys.schema';
import axios from 'axios';

@Injectable()
export class JobBoardsService {
  constructor(
    @InjectModel(JobBoard.name) private jobBoardModel: Model<JobBoardDocument>,
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(ApiKey.name) private apiKeyModel: Model<ApiKeyDocument>,
  ) {}

  async create(createJobBoardDto: any): Promise<JobBoard> {
    // If slug is provided, check for uniqueness
    if (createJobBoardDto.slug) {
      const existingJobBoard = await this.jobBoardModel
        .findOne({ slug: createJobBoardDto.slug })
        .exec();

      if (existingJobBoard) {
        throw new BadRequestException(
          `A job board with slug "${createJobBoardDto.slug}" already exists. Please choose a different slug.`
        );
      }
    }
    
    const createdJobBoard = new this.jobBoardModel(createJobBoardDto);
    return createdJobBoard.save();
  }

  async findAll(companyId: string): Promise<JobBoard[]> {
    return this.jobBoardModel.find({ companyId }).exec();
  }

  async findOne(id: string, companyId: string): Promise<JobBoard> {
    const jobBoard = await this.jobBoardModel.findOne({ _id: id, companyId }).exec();
    if (!jobBoard) {
      throw new NotFoundException(`Job board with ID ${id} not found`);
    }
    return jobBoard;
  }

  async findBySlug(slug: string): Promise<JobBoard> {
    const jobBoard = await this.jobBoardModel.findOne({ slug }).exec();
    if (!jobBoard) {
      throw new NotFoundException(`Job board with slug "${slug}" not found`);
    }
    return jobBoard;
  }

  async update(
    id: string,
    updateJobBoardDto: UpdateJobBoardDto,
    companyId: string,
  ): Promise<JobBoard> {
    // First verify the job board belongs to this company
    await this.findOne(id, companyId);
    
    // If slug is being updated, check for uniqueness
    if (updateJobBoardDto.slug) {
      const existingJobBoard = await this.jobBoardModel
        .findOne({
          slug: updateJobBoardDto.slug,
          _id: { $ne: id }, // Exclude current job board
        })
        .exec();

      if (existingJobBoard) {
        throw new BadRequestException(
          `A job board with slug "${updateJobBoardDto.slug}" already exists. Please choose a different slug.`
        );
      }
    }
    
    const updatedJobBoard = await this.jobBoardModel
      .findByIdAndUpdate(id, updateJobBoardDto, { new: true })
      .exec();

    if (!updatedJobBoard) {
      throw new NotFoundException(`Job board with ID ${id} not found`);
    }

    return updatedJobBoard;
  }

  async remove(id: string, companyId: string): Promise<void> {
    // First verify the job board belongs to this company
    await this.findOne(id, companyId);
    
    const result = await this.jobBoardModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Job board with ID ${id} not found`);
    }
  }

  async createExternalJobBoard(
    source: 'greenhouse' | 'ashby',
    companyId: string,
  ): Promise<JobBoard> {
    const title = source === 'greenhouse' ? 'Greenhouse' : 'Ashby';
    // Check if this external job board already exists for this company
    const existingJobBoard = await this.jobBoardModel
      .findOne({
        source,
        isExternal: true,
        companyId,
      })
      .exec();

    if (existingJobBoard) {
      return existingJobBoard;
    }

    // Create a new external job board
    const jobBoard = new this.jobBoardModel({
      title,
      description: `Integrated job board from ${title}`,
      isExternal: true,
      source,
      settings: {},
      companyId,
    });

    return jobBoard.save();
  }

  async refreshJobsFromATS(
    jobBoardId: string,
    companyId: string,
    userId: string,
  ): Promise<{ imported: number; updated: number; deleted: number; total: number }> {
    // Get the job board
    const jobBoard = await this.findOne(jobBoardId, companyId);

    if (!jobBoard.isExternal) {
      throw new BadRequestException('This job board is not an external integration');
    }

    // Get API credentials for this integration
    const apiKey = await this.apiKeyModel
      .findOne({
        companyId,
        type: jobBoard.source,
        isActive: true,
      })
      .exec();

    if (!apiKey) {
      throw new BadRequestException(
        `No active API key found for ${jobBoard.source}. Please configure your integration first.`,
      );
    }

    let importedCount = 0;
    let updatedCount = 0;
    let deletedCount = 0;
    let totalCount = 0;

    if (jobBoard.source === 'greenhouse') {
      const result = await this.refreshFromGreenhouse(
        apiKey,
        jobBoardId,
        companyId,
        userId,
      );
      importedCount = result.imported;
      updatedCount = result.updated;
      deletedCount = result.deleted;
      totalCount = result.total;
    } else if (jobBoard.source === 'ashby') {
      const result = await this.refreshFromAshby(
        apiKey,
        jobBoardId,
        companyId,
        userId,
      );
      importedCount = result.imported;
      updatedCount = result.updated;
      deletedCount = result.deleted;
      totalCount = result.total;
    }

    return { 
      imported: importedCount, 
      updated: updatedCount, 
      deleted: deletedCount,
      total: totalCount 
    };
  }

  private async refreshFromGreenhouse(
    apiKey: ApiKeyDocument,
    jobBoardId: string,
    companyId: string,
    userId: string,
  ): Promise<{ imported: number; updated: number; deleted: number; total: number }> {
    const baseUrl = apiKey.baseUrl || 'https://boards-api.greenhouse.io/v1/boards/';
    const atsCompanyId = apiKey.atsCompanyId;

    if (!atsCompanyId) {
      throw new BadRequestException('ATS Company ID is not configured');
    }

    // Fetch jobs list from Greenhouse
    const jobsListUrl = `${baseUrl}${atsCompanyId}/jobs`;
    const jobsResponse = await axios.get(jobsListUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from(apiKey.apiKey + ':').toString('base64')}`,
      },
    });

    const greenhouseJobs = jobsResponse.data.jobs || [];
    const totalCount = greenhouseJobs.length;
    let importedCount = 0;
    let updatedCount = 0;
    let deletedCount = 0;

    // Track external IDs from ATS
    const atsExternalIds = new Set(greenhouseJobs.map(job => String(job.id)));

    for (const ghJob of greenhouseJobs) {
      // Add 1 second delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));

      // Fetch detailed job info
      const jobDetailUrl = `${baseUrl}${atsCompanyId}/jobs/${ghJob.id}`;
      console.log(`Fetching job ${importedCount + updatedCount + 1}/${totalCount}: ${jobDetailUrl}`);
      const detailResponse = await axios.get(jobDetailUrl, {
        headers: {
          Authorization: `Basic ${Buffer.from(apiKey.apiKey + ':').toString('base64')}`,
        },
      });

      const jobDetail = detailResponse.data;

      // Check if job already exists
      const existingJob = await this.jobModel
        .findOne({
          externalId: String(jobDetail.id),
          jobBoardId,
          companyId,
        })
        .exec();

      const jobData = {
        title: jobDetail.title || ghJob.title,
        content: jobDetail.content || 'No description available',
        location: jobDetail.location?.name || ghJob.location?.name || 'Remote',
        status: 'published' as any,
        internalId: String(ghJob.internal_job_id || ghJob.id),
        externalId: String(ghJob.id),
        externalUrl: ghJob.absolute_url,
        jobBoardId,
        companyId,
      };

      if (existingJob) {
        // Update existing job - use findByIdAndUpdate for better control
        await this.jobModel.findByIdAndUpdate(
          existingJob._id,
          {
            title: jobData.title,
            content: jobData.content,
            location: jobData.location,
            status: jobData.status,
            internalId: jobData.internalId,
            externalId: jobData.externalId,
            externalUrl: jobData.externalUrl,
          },
          { new: true }
        ).exec();
        updatedCount++;
      } else {
        // Create new job
        const newJob = new this.jobModel({
          ...jobData,
          createdBy: userId,
        });
        await newJob.save();
        importedCount++;
      }
    }

    // Delete jobs that are no longer in Greenhouse
    const existingJobs = await this.jobModel.find({
      jobBoardId,
      companyId,
      externalId: { $exists: true, $ne: null }
    }).exec();

    for (const existingJob of existingJobs) {
      if (!atsExternalIds.has(existingJob.externalId)) {
        // Job no longer exists in ATS, delete it and all related data
        const jobId = existingJob._id;
        
        // Delete all job applications for this job
        const jobApplicationModel = this.jobModel.db.model('JobApplication');
        const deleteResult = await jobApplicationModel.deleteMany({ jobId }).exec();
        console.log(`Deleted ${deleteResult.deletedCount} job applications for job ${existingJob.title}`);
        
        // Delete the job
        await this.jobModel.findByIdAndDelete(jobId).exec();
        deletedCount++;
        console.log(`Deleted job ${existingJob.title} (${existingJob.externalId}) - no longer in Greenhouse`);
      }
    }

    return { 
      imported: importedCount, 
      updated: updatedCount, 
      deleted: deletedCount,
      total: totalCount 
    };
  }

  private async refreshFromAshby(
    apiKey: ApiKeyDocument,
    jobBoardId: string,
    companyId: string,
    userId: string,
  ): Promise<{ imported: number; updated: number; deleted: number; total: number }> {
    const baseUrl = apiKey.baseUrl || 'https://api.ashbyhq.com/posting-api/job-board/';
    const atsCompanyId = apiKey.atsCompanyId;

    if (!atsCompanyId) {
      throw new BadRequestException('ATS Company ID is not configured');
    }

    // Fetch jobs from Ashby
    const jobsUrl = `${baseUrl}${atsCompanyId}`;
    const response = await axios.get(jobsUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from(apiKey.apiKey + ':').toString('base64')}`,
      },
    });

    const ashbyJobs = response.data.jobs || [];
    const totalCount = ashbyJobs.length;
    let importedCount = 0;
    let updatedCount = 0;
    let deletedCount = 0;

    // Track external IDs from ATS
    const atsExternalIds = new Set(ashbyJobs.map(job => job.id));

    for (const ashbyJob of ashbyJobs) {
      // Add 1 second delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if job already exists
      const existingJob = await this.jobModel
        .findOne({
          externalId: ashbyJob.id,
          jobBoardId,
          companyId,
        })
        .exec();

      const jobData = {
        title: ashbyJob.title,
        content: ashbyJob.description || ashbyJob.descriptionHtml || 'No description available',
        location: ashbyJob.location || ashbyJob.locationName || 'Remote',
        status: 'published' as any,
        internalId: String(ashbyJob.internalJobId || ashbyJob.id),
        externalId: ashbyJob.id,
        externalUrl: ashbyJob.jobUrl,
        jobBoardId,
        companyId,
      };

      if (existingJob) {
        // Update existing job - use findByIdAndUpdate for better control
        await this.jobModel.findByIdAndUpdate(
          existingJob._id,
          {
            title: jobData.title,
            content: jobData.content,
            location: jobData.location,
            status: jobData.status,
            internalId: jobData.internalId,
            externalId: jobData.externalId,
            externalUrl: jobData.externalUrl,
          },
          { new: true }
        ).exec();
        updatedCount++;
      } else {
        // Create new job
        const newJob = new this.jobModel({
          ...jobData,
          createdBy: userId,
        });
        await newJob.save();
        importedCount++;
      }
    }

    // Delete jobs that are no longer in Ashby
    const existingJobs = await this.jobModel.find({
      jobBoardId,
      companyId,
      externalId: { $exists: true, $ne: null }
    }).exec();

    for (const existingJob of existingJobs) {
      if (!atsExternalIds.has(existingJob.externalId)) {
        // Job no longer exists in ATS, delete it and all related data
        const jobId = existingJob._id;
        
        // Delete all job applications for this job
        const jobApplicationModel = this.jobModel.db.model('JobApplication');
        const deleteResult = await jobApplicationModel.deleteMany({ jobId }).exec();
        console.log(`Deleted ${deleteResult.deletedCount} job applications for job ${existingJob.title}`);
        
        // Delete the job
        await this.jobModel.findByIdAndDelete(jobId).exec();
        deletedCount++;
        console.log(`Deleted job ${existingJob.title} (${existingJob.externalId}) - no longer in Ashby`);
      }
    }

    return { 
      imported: importedCount, 
      updated: updatedCount, 
      deleted: deletedCount,
      total: totalCount 
    };
  }

  private mapGreenhouseEmploymentType(metadata: any[]): string {
    if (!metadata || !Array.isArray(metadata)) return 'full-time';
    
    const typeField = metadata.find(m => m.name?.toLowerCase().includes('employment type'));
    if (typeField?.value) {
      const value = typeField.value.toLowerCase();
      if (value.includes('part')) return 'part-time';
      if (value.includes('contract')) return 'contract';
      if (value.includes('intern')) return 'internship';
    }
    return 'full-time';
  }

  private mapAshbyEmploymentType(employmentType: string): string {
    if (!employmentType) return 'full-time';
    
    const type = employmentType.toLowerCase();
    if (type.includes('part')) return 'part-time';
    if (type.includes('contract')) return 'contract';
    if (type.includes('intern')) return 'internship';
    return 'full-time';
  }
}
