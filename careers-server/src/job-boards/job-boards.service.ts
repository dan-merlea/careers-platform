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

  async create(createJobBoardDto: CreateJobBoardDto): Promise<JobBoard> {
    const createdJobBoard = new this.jobBoardModel(createJobBoardDto);
    return createdJobBoard.save();
  }

  async findAll(): Promise<JobBoard[]> {
    return this.jobBoardModel.find().exec();
  }

  async findOne(id: string): Promise<JobBoard> {
    const jobBoard = await this.jobBoardModel.findById(id).exec();
    if (!jobBoard) {
      throw new NotFoundException(`Job board with ID ${id} not found`);
    }
    return jobBoard;
  }

  async update(
    id: string,
    updateJobBoardDto: UpdateJobBoardDto,
  ): Promise<JobBoard> {
    const updatedJobBoard = await this.jobBoardModel
      .findByIdAndUpdate(id, updateJobBoardDto, { new: true })
      .exec();

    if (!updatedJobBoard) {
      throw new NotFoundException(`Job board with ID ${id} not found`);
    }

    return updatedJobBoard;
  }

  async remove(id: string): Promise<void> {
    const result = await this.jobBoardModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Job board with ID ${id} not found`);
    }
  }

  async createExternalJobBoard(
    source: 'greenhouse' | 'ashby',
  ): Promise<JobBoard> {
    const title = source === 'greenhouse' ? 'Greenhouse' : 'Ashby';
    // Check if this external job board already exists
    const existingJobBoard = await this.jobBoardModel
      .findOne({
        source,
        isExternal: true,
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
    });

    return jobBoard.save();
  }
}
