import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JobFunction } from './job-function.model';
import { JobFunctionDocument } from './schemas/job-function.schema';
import { CreateJobFunctionDto } from './dto/create-job-function.dto';
import { UpdateJobFunctionDto } from './dto/update-job-function.dto';

@Injectable()
export class JobFunctionService {
  constructor(
    @InjectModel('JobFunction')
    private readonly jobFunctionModel: Model<JobFunctionDocument>,
  ) {}

  async create(
    createJobFunctionDto: CreateJobFunctionDto,
  ): Promise<JobFunction> {
    const newJobFunction = new this.jobFunctionModel(createJobFunctionDto);
    const savedJobFunction = await newJobFunction.save();
    return this.toJobFunction(savedJobFunction);
  }

  async findAll(): Promise<JobFunction[]> {
    const jobFunctions = await this.jobFunctionModel.find().exec();
    return jobFunctions.map((jf) => this.toJobFunction(jf));
  }

  async findByCompany(companyId: string): Promise<JobFunction[]> {
    const jobFunctions = await this.jobFunctionModel
      .find({ company: companyId })
      .exec();
    return jobFunctions.map((jf) => this.toJobFunction(jf));
  }

  async findOne(id: string): Promise<JobFunction> {
    const jobFunction = await this.jobFunctionModel.findById(id).exec();
    if (!jobFunction) {
      throw new NotFoundException(`Job Function with ID ${id} not found`);
    }
    return this.toJobFunction(jobFunction);
  }

  async update(
    id: string,
    updateJobFunctionDto: UpdateJobFunctionDto,
  ): Promise<JobFunction> {
    const updatedJobFunction = await this.jobFunctionModel
      .findByIdAndUpdate(id, updateJobFunctionDto, { new: true })
      .exec();
    if (!updatedJobFunction) {
      throw new NotFoundException(`Job Function with ID ${id} not found`);
    }
    return this.toJobFunction(updatedJobFunction);
  }

  async remove(id: string): Promise<void> {
    const result = await this.jobFunctionModel
      .deleteOne({ _id: new Types.ObjectId(id) })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Job Function with ID ${id} not found`);
    }
  }

  async createDefaultJobFunctions(companyId: string): Promise<JobFunction[]> {
    // Convert string ID to ObjectId
    const companyObjectId = new Types.ObjectId(companyId);
    const defaultJobFunctions = [
      { title: 'Engineering', company: companyObjectId },
      { title: 'Marketing', company: companyObjectId },
      { title: 'Sales', company: companyObjectId },
      { title: 'Product', company: companyObjectId },
      { title: 'Design', company: companyObjectId },
      { title: 'Operations', company: companyObjectId },
      { title: 'Human Resources', company: companyObjectId },
      { title: 'Finance', company: companyObjectId },
    ];

    const createdFunctions =
      await this.jobFunctionModel.insertMany(defaultJobFunctions);
    return createdFunctions.map((jf) =>
      this.toJobFunction(jf as unknown as JobFunctionDocument),
    );
  }

  /**
   * Helper method to convert Mongoose document to plain JobFunction object
   * @param document - JobFunction document from Mongoose
   * @returns Plain JobFunction object
   */
  private toJobFunction(document: JobFunctionDocument): JobFunction {
    const plainDoc = document.toObject() as JobFunction;
    return plainDoc;
  }
}
