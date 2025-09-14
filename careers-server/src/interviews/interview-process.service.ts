import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InterviewProcess, InterviewProcessDocument } from './interview-process.entity';
import { InterviewProcessCreateDto, InterviewProcessUpdateDto } from './interview-process.model';

@Injectable()
export class InterviewProcessService {
  constructor(
    @InjectModel(InterviewProcess.name)
    private interviewProcessModel: Model<InterviewProcessDocument>,
  ) {}

  async findAll(companyId: string): Promise<InterviewProcessDocument[]> {
    return this.interviewProcessModel
      .find({ companyId: new Types.ObjectId(companyId) })
      .populate('jobRoleId')
      .populate('companyId')
      .populate('createdBy')
      .exec();
  }

  async findByJobRole(jobRoleId: string): Promise<InterviewProcessDocument[]> {
    return this.interviewProcessModel
      .find({ jobRoleId: new Types.ObjectId(jobRoleId) })
      .populate('jobRoleId')
      .populate('companyId')
      .populate('createdBy')
      .exec();
  }

  async findOne(id: string): Promise<InterviewProcessDocument> {
    const interviewProcess = await this.interviewProcessModel
      .findById(id)
      .populate('jobRoleId')
      .populate('companyId')
      .populate('createdBy')
      .exec();

    if (!interviewProcess) {
      throw new NotFoundException(`Interview process with ID ${id} not found`);
    }

    return interviewProcess;
  }

  async create(
    interviewProcessCreateDto: InterviewProcessCreateDto,
    createdBy: string,
    companyId: string,
  ): Promise<InterviewProcessDocument> {
    // Add stages order if not provided and convert considerations to proper format
    const stages = interviewProcessCreateDto.stages.map((stage, index) => {
      // Convert considerations to objects if they are strings
      const considerations = stage.considerations.map(consideration => {
        if (typeof consideration === 'string') {
          return { title: consideration, description: consideration };
        }
        return consideration;
      });
      
      return {
        ...stage,
        considerations,
        order: stage.order || index,
      };
    });

    const newInterviewProcess = new this.interviewProcessModel({
      ...interviewProcessCreateDto,
      stages,
      createdBy: new Types.ObjectId(createdBy),
      companyId: new Types.ObjectId(companyId),
    });

    return newInterviewProcess.save();
  }

  async update(
    id: string,
    interviewProcessUpdateDto: InterviewProcessUpdateDto,
  ): Promise<InterviewProcessDocument> {
    const interviewProcess = await this.findOne(id);

    // Update stages order if provided and convert considerations to proper format
    if (interviewProcessUpdateDto.stages) {
      interviewProcessUpdateDto.stages = interviewProcessUpdateDto.stages.map((stage, index) => {
        // Convert considerations to objects if they are strings
        const considerations = stage.considerations.map(consideration => {
          if (typeof consideration === 'string') {
            return { title: consideration, description: consideration };
          }
          return consideration;
        });
        
        return {
          ...stage,
          considerations,
          order: stage.order || index,
        };
      });
    }

    // Update fields
    Object.assign(interviewProcess, interviewProcessUpdateDto);

    return interviewProcess.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.interviewProcessModel.deleteOne({ _id: id }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Interview process with ID ${id} not found`);
    }
  }
}
