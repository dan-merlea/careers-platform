import { Injectable, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { sanitizeHtmlContent } from '../utils/html-sanitizer';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument } from './job.entity';
import {
  JobCreateDto,
  JobStatus,
  JobUpdateDto,
  JobCreateFromHeadcountDto,
} from './job.model';
import { Company, CompanyDocument } from '../company/schemas/company.schema';
import {
  Department,
  DepartmentDocument,
} from '../company/schemas/department.schema';
import { Office, OfficeDocument } from '../company/schemas/office.schema';

@Injectable()
export class JobService {
  constructor(
    @InjectModel(Job.name)
    private jobModel: Model<JobDocument>,

    @InjectModel(Company.name)
    private companyModel: Model<CompanyDocument>,

    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,

    @InjectModel(Office.name)
    private officeModel: Model<OfficeDocument>,
  ) {}

  async findAll(): Promise<JobDocument[]> {
    return this.jobModel
      .find()
      .populate('companyId')
      .populate('departments')
      .populate('offices')
      .exec();
  }

  async findByCompany(companyId: string): Promise<JobDocument[]> {
    return this.jobModel
      .find({ companyId: new Types.ObjectId(companyId) })
      .populate('companyId')
      .populate('departments')
      .populate('offices')
      .exec();
  }

  async findOne(id: string): Promise<JobDocument> {
    const job = await this.jobModel
      .findById(id)
      .populate('companyId')
      .populate('departments')
      .populate('offices')
      .exec();

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    return job;
  }

  async create(jobCreateDto: JobCreateDto): Promise<JobDocument> {
    const { companyId, departmentIds, officeIds, ...jobData } = jobCreateDto;

    // Find related entities
    const company = await this.companyModel.findById(companyId).exec();
    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    // Convert string IDs to ObjectIds
    const departmentObjectIds = departmentIds.map(
      (id) => new Types.ObjectId(id),
    );
    const officeObjectIds = officeIds.map((id) => new Types.ObjectId(id));

    // Sanitize HTML content to prevent script injection
    const sanitizedContent = sanitizeHtmlContent(jobData.content);

    // Create new job - always set status to DRAFT regardless of what's in the DTO
    const newJob = new this.jobModel({
      ...jobData,
      content: sanitizedContent,
      status: JobStatus.DRAFT, // Always enforce DRAFT status for new jobs
      company: company._id,
      departments: departmentObjectIds,
      offices: officeObjectIds,
    });

    // We don't need to set publishedDate since status is always DRAFT

    return newJob.save();
  }

  async createFromHeadcount(
    jobCreateDto: JobCreateFromHeadcountDto,
  ): Promise<JobDocument> {
    const {
      companyId,
      departmentIds,
      officeIds,
      headcountRequestId,
      ...jobData
    } = jobCreateDto;

    // Check if a job already exists for this headcount request
    const existingJob = await this.jobModel
      .findOne({ headcountRequestId: new Types.ObjectId(headcountRequestId) })
      .exec();
    if (existingJob) {
      throw new Error(
        `A job has already been created for headcount request ${headcountRequestId}`,
      );
    }

    // Find related entities
    const company = await this.companyModel.findById(companyId).exec();
    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    // Determine if approval should be skipped based on company settings
    // If approval type is 'job', we don't skip approval
    const skipApproval = company.settings?.approvalType !== 'job-opening';

    // Convert string IDs to ObjectIds
    const departmentObjectIds = departmentIds.map(
      (id) => new Types.ObjectId(id),
    );
    const officeObjectIds = officeIds.map((id) => new Types.ObjectId(id));

    // Sanitize HTML content to prevent script injection
    const sanitizedContent = sanitizeHtmlContent(jobData.content);

    // Create new job - set status based on skipApproval flag
    const newJob = new this.jobModel({
      ...jobData,
      content: sanitizedContent,
      // If skipApproval is true, set status to APPROVED, otherwise use DRAFT
      status: skipApproval ? JobStatus.APPROVED : JobStatus.DRAFT,
      company: company._id,
      departments: departmentObjectIds,
      offices: officeObjectIds,
      headcountRequestId: new Types.ObjectId(headcountRequestId),
    });

    // Set approvedAt and approvedBy if we're skipping approval
    if (skipApproval) {
      newJob.approvedAt = new Date();
      newJob.approvedBy = 'system'; // Indicate that this was auto-approved
    }

    // Save the job
    const savedJob = await newJob.save();

    // Update the headcount request to mark it as having a job created
    // We need to use the mongoose driver directly since we don't have the HeadcountRequest model injected
    // The collection name is determined by Mongoose based on the model name
    await this.jobModel.db
      .collection('headcountrequests')
      .updateOne(
        { _id: new Types.ObjectId(headcountRequestId) },
        { $set: { hasJobCreated: true, jobId: savedJob._id } },
      );

    // Log the update for debugging
    console.log(
      `Updated headcount request ${headcountRequestId} with jobId ${savedJob._id} and hasJobCreated=true`,
    );

    return savedJob;
  }

  async update(id: string, jobUpdateDto: JobUpdateDto): Promise<JobDocument> {
    const job = await this.findOne(id);
    const { companyId, departmentIds, officeIds, ...jobData } = jobUpdateDto;

    // Sanitize HTML content if provided
    if (jobData.content) {
      jobData.content = sanitizeHtmlContent(jobData.content);
    }

    // Update simple fields
    Object.assign(job, jobData);

    // Update company if provided
    if (companyId) {
      const company = await this.companyModel.findById(companyId).exec();
      if (!company) {
        throw new NotFoundException(`Company with ID ${companyId} not found`);
      }
      // Set company ID properly with type safety
      job.companyId = company._id;
    }

    // Update departments if provided
    if (departmentIds) {
      // Set departments with proper typing
      job.departments = departmentIds.map((id) => new Types.ObjectId(id));
    }

    // Update offices if provided
    if (officeIds) {
      // Set offices with proper typing
      job.offices = officeIds.map((id) => new Types.ObjectId(id));
    }

    // Set publishedDate if status is changing to PUBLISHED
    if (jobData.status === JobStatus.PUBLISHED && !job.publishedDate) {
      job.publishedDate = new Date();
    }

    return job.save();
  }

  async remove(id: string): Promise<void> {
    await this.jobModel.findByIdAndDelete(id).exec();
  }

  async findByDepartment(departmentId: string): Promise<JobDocument[]> {
    return this.jobModel
      .find({ departments: { $in: [new Types.ObjectId(departmentId)] } })
      .populate('companyId')
      .populate('departments')
      .populate('offices')
      .exec();
  }

  async findByOffice(officeId: string): Promise<JobDocument[]> {
    return this.jobModel
      .find({ offices: { $in: [new Types.ObjectId(officeId)] } })
      .populate('companyId')
      .populate('departments')
      .populate('offices')
      .exec();
  }

  async findByIds(ids: string[]): Promise<JobDocument[]> {
    const objectIds = ids.map((id) => new Types.ObjectId(id));
    return this.jobModel
      .find({ _id: { $in: objectIds } })
      .populate('companyId')
      .populate('departments')
      .populate('offices')
      .exec();
  }

  async submitForApproval(id: string): Promise<JobDocument> {
    const job = await this.findOne(id);

    // Only draft jobs can be submitted for approval
    if (job.status !== JobStatus.DRAFT) {
      throw new Error('Only draft jobs can be submitted for approval');
    }

    job.status = JobStatus.PENDING_APPROVAL;
    return job.save();
  }

  async approveJob(id: string, userId: string): Promise<JobDocument> {
    const job = await this.findOne(id);

    // Only pending approval jobs can be approved
    if (job.status !== JobStatus.PENDING_APPROVAL) {
      throw new Error('Only jobs pending approval can be approved');
    }

    job.status = JobStatus.APPROVED;
    job.approvedBy = userId;
    job.approvedAt = new Date();
    return job.save();
  }

  async rejectJob(
    id: string,
    userId: string,
    rejectionReason: string,
  ): Promise<JobDocument> {
    const job = await this.findOne(id);

    // Only pending approval jobs can be rejected
    if (job.status !== JobStatus.PENDING_APPROVAL) {
      throw new Error('Only jobs pending approval can be rejected');
    }

    job.status = JobStatus.REJECTED;
    job.rejectedBy = userId;
    job.rejectionReason = rejectionReason;
    job.rejectedAt = new Date();
    return job.save();
  }

  async publishJob(id: string): Promise<JobDocument> {
    const job = await this.findOne(id);

    // Only approved jobs can be published
    if (job.status !== JobStatus.APPROVED) {
      throw new Error('Only approved jobs can be published');
    }

    job.status = JobStatus.PUBLISHED;
    job.publishedDate = new Date();
    return job.save();
  }

  async archiveJob(id: string): Promise<JobDocument> {
    const job = await this.findOne(id);
    job.status = JobStatus.ARCHIVED;
    return job.save();
  }

  async findByJobBoard(jobBoardId: string): Promise<JobDocument[]> {
    return this.jobModel
      .find({ jobBoardId })
      .populate('companyId')
      .populate('departments')
      .populate('offices')
      .exec();
  }

  async findByStatus(status: JobStatus): Promise<JobDocument[]> {
    return this.jobModel
      .find({ status })
      .populate('companyId')
      .populate('departments')
      .populate('offices')
      .exec();
  }
}
