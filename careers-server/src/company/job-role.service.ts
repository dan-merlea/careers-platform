import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobRole } from './job-role.model';
import { JobRoleDocument } from './schemas/job-role.schema';
import { CreateJobRoleDto } from './dto/create-job-role.dto';
import { UpdateJobRoleDto } from './dto/update-job-role.dto';

@Injectable()
export class JobRoleService {
  constructor(
    @InjectModel('JobRole')
    private readonly jobRoleModel: Model<JobRoleDocument>,
  ) {}

  async create(createJobRoleDto: CreateJobRoleDto): Promise<JobRole> {
    const newJobRole = new this.jobRoleModel(createJobRoleDto);
    const savedRole = await newJobRole.save();
    return this.toJobRole(savedRole);
  }

  async findAll(): Promise<JobRole[]> {
    const roles = await this.jobRoleModel.find().populate('jobFunction').exec();
    return roles.map((role) => this.toJobRole(role));
  }

  async findByJobFunction(jobFunctionId: string): Promise<JobRole[]> {
    const roles = await this.jobRoleModel
      .find({ jobFunction: jobFunctionId })
      .populate('jobFunction')
      .exec();
    return roles.map((role) => this.toJobRole(role));
  }

  async findOne(id: string): Promise<JobRole> {
    const jobRole = await this.jobRoleModel
      .findById(id)
      .populate('jobFunction')
      .exec();
    if (!jobRole) {
      throw new NotFoundException(`Job Role with ID ${id} not found`);
    }
    return this.toJobRole(jobRole);
  }

  async update(
    id: string,
    updateJobRoleDto: UpdateJobRoleDto,
  ): Promise<JobRole> {
    const updatedJobRole = await this.jobRoleModel
      .findByIdAndUpdate(id, updateJobRoleDto, { new: true })
      .populate('jobFunction')
      .exec();

    if (!updatedJobRole) {
      throw new NotFoundException(`Job Role with ID ${id} not found`);
    }

    return this.toJobRole(updatedJobRole);
  }

  async remove(id: string): Promise<void> {
    const result = await this.jobRoleModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Job Role with ID ${id} not found`);
    }
  }

  private toJobRole(document: JobRoleDocument): JobRole {
    return document.toObject() as JobRole;
  }
}
