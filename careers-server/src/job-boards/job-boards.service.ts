import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobBoard, JobBoardDocument } from './schemas/job-board.schema';
import { CreateJobBoardDto } from './dto/create-job-board.dto';
import { UpdateJobBoardDto } from './dto/update-job-board.dto';

@Injectable()
export class JobBoardsService {
  constructor(
    @InjectModel(JobBoard.name) private jobBoardModel: Model<JobBoardDocument>,
  ) {}

  async create(createJobBoardDto: any): Promise<JobBoard> {
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

  async update(
    id: string,
    updateJobBoardDto: UpdateJobBoardDto,
    companyId: string,
  ): Promise<JobBoard> {
    // First verify the job board belongs to this company
    await this.findOne(id, companyId);
    
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
}
