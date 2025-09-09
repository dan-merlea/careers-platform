import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobApplication, JobApplicationDocument, ApplicationStatus } from './schemas/job-application.schema';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { JobApplicationResponseDto } from './dto/job-application-response.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { GridFsService } from '../gridfs/gridfs.service';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination?: string;
  filename?: string;
  path?: string;
  buffer: Buffer;
}

@Injectable()
export class JobApplicationsService {
  constructor(
    @InjectModel(JobApplication.name) private jobApplicationModel: Model<JobApplicationDocument>,
    private readonly gridFsService: GridFsService,
  ) {}

  async create(
    createJobApplicationDto: CreateJobApplicationDto,
    file: MulterFile,
  ): Promise<JobApplicationResponseDto> {
    // Calculate consent expiration date
    const consentExpiresAt = new Date();
    consentExpiresAt.setMonth(
      consentExpiresAt.getMonth() + createJobApplicationDto.consentDuration,
    );

    // Upload file to GridFS
    const fileId = await this.gridFsService.uploadFile(file, {
      jobId: createJobApplicationDto.jobId,
      applicantEmail: createJobApplicationDto.email,
    });

    // Create new job application
    const newJobApplication = new this.jobApplicationModel({
      ...createJobApplicationDto,
      resumeId: fileId,
      resumeFilename: file.originalname,
      resumeMimeType: file.mimetype,
      consentExpiresAt,
    });

    // Save to database
    const savedApplication = await newJobApplication.save();

    return this.mapToResponseDto(savedApplication);
  }

  async findAll(): Promise<JobApplicationResponseDto[]> {
    const applications = await this.jobApplicationModel.find().exec();
    return applications.map(app => this.mapToResponseDto(app));
  }

  async findByJob(jobId: string): Promise<JobApplicationResponseDto[]> {
    const applications = await this.jobApplicationModel.find({ jobId }).exec();
    return applications.map(app => this.mapToResponseDto(app));
  }

  async findOne(id: string): Promise<JobApplicationResponseDto> {
    const application = await this.jobApplicationModel.findById(id).exec();
    
    if (!application) {
      throw new NotFoundException(`Job application with ID ${id} not found`);
    }
    
    return this.mapToResponseDto(application);
  }

  async getResume(id: string): Promise<{
    stream: any;
    filename: string;
    mimetype: string;
  }> {
    const application = await this.jobApplicationModel.findById(id).exec();
    
    if (!application) {
      throw new NotFoundException(`Job application with ID ${id} not found`);
    }
    
    try {
      const { stream, file } = await this.gridFsService.getFile(application.resumeId);
      
      return {
        stream,
        filename: application.resumeFilename,
        mimetype: application.resumeMimeType,
      };
    } catch (error) {
      throw new NotFoundException('Resume file not found');
    }
  }

  async remove(id: string): Promise<void> {
    const application = await this.jobApplicationModel.findById(id).exec();
    
    if (!application) {
      throw new NotFoundException(`Job application with ID ${id} not found`);
    }
    
    // Delete the resume file from GridFS
    try {
      await this.gridFsService.deleteFile(application.resumeId);
    } catch (error) {
      console.error(`Error deleting resume file: ${error.message}`);
    }
    
    // Delete the application from database
    await this.jobApplicationModel.findByIdAndDelete(id).exec();
  }

  async cleanupExpiredApplications(): Promise<number> {
    const now = new Date();
    const expiredApplications = await this.jobApplicationModel
      .find({ consentExpiresAt: { $lt: now } })
      .exec();
    
    let deletedCount = 0;
    
    for (const application of expiredApplications) {
      try {
        // Delete resume file from GridFS
        await this.gridFsService.deleteFile(application.resumeId);
        
        // Delete application from database
        const appId = application._id?.toString();
        if (appId) {
          await this.jobApplicationModel.findByIdAndDelete(appId).exec();
          deletedCount++;
        }
      } catch (error: any) {
        const appId = application._id?.toString() || 'unknown';
        console.error(
          `Error deleting expired application ${appId}: ${error.message}`
        );
      }
    }
    
    return deletedCount;
  }

  /**
   * Update the status of a job application
   * @param id The ID of the job application to update
   * @param updateStatusDto The new status
   * @returns The updated job application
   */
  async updateStatus(
    id: string,
    updateStatusDto: UpdateApplicationStatusDto,
  ): Promise<JobApplicationResponseDto> {
    const application = await this.jobApplicationModel.findById(id);
    
    if (!application) {
      throw new NotFoundException(`Job application with ID ${id} not found`);
    }
    
    application.status = updateStatusDto.status;
    await application.save();
    
    return this.mapToResponseDto(application);
  }

  private mapToResponseDto(
    application: JobApplicationDocument,
  ): JobApplicationResponseDto {
    return {
      id: application._id?.toString() || '',
      firstName: application.firstName,
      lastName: application.lastName,
      email: application.email,
      phone: application.phone,
      linkedin: application.linkedin,
      website: application.website,
      resumeFilename: application.resumeFilename,
      consentDuration: application.consentDuration,
      consentExpiresAt: application.consentExpiresAt,
      jobId: typeof application.jobId === 'object' ? application.jobId.toString() : application.jobId,
      status: application.status,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };
  }
}
