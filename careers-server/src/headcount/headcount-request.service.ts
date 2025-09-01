import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HeadcountRequest, HeadcountStatus } from './headcount-request.model';

@Injectable()
export class HeadcountRequestService {
  constructor(
    @InjectModel(HeadcountRequest.name)
    private headcountRequestModel: Model<HeadcountRequest>,
  ) {}

  async create(createHeadcountRequestDto: any, userId: string): Promise<HeadcountRequest> {
    const newHeadcountRequest = new this.headcountRequestModel({
      ...createHeadcountRequestDto,
      requestedBy: userId,
      status: HeadcountStatus.PENDING,
    });
    return newHeadcountRequest.save();
  }

  async findAll(filters: any = {}): Promise<HeadcountRequest[]> {
    return this.headcountRequestModel
      .find(filters)
      .populate('requestedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUser(userId: string): Promise<HeadcountRequest[]> {
    return this.findAll({ requestedBy: userId });
  }

  async findOne(id: string): Promise<HeadcountRequest> {
    const headcountRequest = await this.headcountRequestModel
      .findById(id)
      .populate('requestedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .exec();
    
    if (!headcountRequest) {
      throw new NotFoundException(`Headcount request with ID ${id} not found`);
    }
    
    return headcountRequest;
  }

  async update(id: string, updateHeadcountRequestDto: any): Promise<HeadcountRequest> {
    const updatedHeadcountRequest = await this.headcountRequestModel
      .findByIdAndUpdate(id, updateHeadcountRequestDto, { new: true })
      .exec();
    
    if (!updatedHeadcountRequest) {
      throw new NotFoundException(`Headcount request with ID ${id} not found`);
    }
    
    return updatedHeadcountRequest;
  }

  async approve(id: string, userId: string, reviewNotes?: string): Promise<HeadcountRequest> {
    const headcountRequest = await this.findOne(id);
    
    if (headcountRequest.status !== HeadcountStatus.PENDING) {
      throw new ForbiddenException('This headcount request has already been reviewed');
    }
    
    return this.update(id, {
      status: HeadcountStatus.APPROVED,
      reviewedBy: userId,
      reviewNotes,
      reviewedAt: new Date(),
    });
  }

  async reject(id: string, userId: string, reviewNotes?: string): Promise<HeadcountRequest> {
    const headcountRequest = await this.findOne(id);
    
    if (headcountRequest.status !== HeadcountStatus.PENDING) {
      throw new ForbiddenException('This headcount request has already been reviewed');
    }
    
    return this.update(id, {
      status: HeadcountStatus.REJECTED,
      reviewedBy: userId,
      reviewNotes,
      reviewedAt: new Date(),
    });
  }

  async remove(id: string): Promise<void> {
    const result = await this.headcountRequestModel.deleteOne({ _id: id }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Headcount request with ID ${id} not found`);
    }
  }
}
