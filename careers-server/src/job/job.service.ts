import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Job, JobDocument } from './job.entity';
import { JobCreateDto, JobStatus, JobUpdateDto } from './job.model';
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
    return this.jobModel.find()
      .populate('company')
      .populate('departments')
      .populate('offices')
      .exec();
  }

  async findByCompany(companyId: string): Promise<JobDocument[]> {
    return this.jobModel.find({ company: new Types.ObjectId(companyId) })
      .populate('company')
      .populate('departments')
      .populate('offices')
      .exec();
  }

  async findOne(id: string): Promise<JobDocument> {
    const job = await this.jobModel.findById(id)
      .populate('company')
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
    const departmentObjectIds = departmentIds.map((id) => new Types.ObjectId(id));
    const officeObjectIds = officeIds.map((id) => new Types.ObjectId(id));

    // Create new job
    const newJob = new this.jobModel({
      ...jobData,
      company: company._id,
      departments: departmentObjectIds,
      offices: officeObjectIds,
    });

    // Set publishedDate if status is PUBLISHED
    if (jobData.status === JobStatus.PUBLISHED) {
      newJob.publishedDate = new Date();
    }

    return newJob.save();
  }

  async update(id: string, jobUpdateDto: JobUpdateDto): Promise<JobDocument> {
    const job = await this.findOne(id);
    const { companyId, departmentIds, officeIds, ...jobData } = jobUpdateDto;

    // Update simple fields
    Object.assign(job, jobData);

    // Update company if provided
    if (companyId) {
      const company = await this.companyModel.findById(companyId).exec();
      if (!company) {
        throw new NotFoundException(`Company with ID ${companyId} not found`);
      }
      // Cast to any to avoid TypeScript errors with ObjectId vs Company
      (job as any).company = company._id;
    }

    // Update departments if provided
    if (departmentIds) {
      // Cast to any to avoid TypeScript errors with ObjectId vs Department
      job.departments = departmentIds.map((id) => new Types.ObjectId(id)) as any;
    }

    // Update offices if provided
    if (officeIds) {
      // Cast to any to avoid TypeScript errors with ObjectId vs Office
      job.offices = officeIds.map((id) => new Types.ObjectId(id)) as any;
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
    return this.jobModel.find({ departments: new Types.ObjectId(departmentId) })
      .populate('company')
      .populate('departments')
      .populate('offices')
      .exec();
  }

  async findByOffice(officeId: string): Promise<JobDocument[]> {
    return this.jobModel.find({ offices: new Types.ObjectId(officeId) })
      .populate('company')
      .populate('departments')
      .populate('offices')
      .exec();
  }

  async publishJob(id: string): Promise<JobDocument> {
    const job = await this.findOne(id);
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
    return this.jobModel.find({ jobBoardId: new Types.ObjectId(jobBoardId) })
      .populate('company')
      .populate('departments')
      .populate('offices')
      .exec();
  }

  async findByStatus(status: JobStatus): Promise<JobDocument[]> {
    return this.jobModel.find({ status })
      .populate('company')
      .populate('departments')
      .populate('offices')
      .exec();
  }
}
