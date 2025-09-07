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

  async create(createHeadcountRequestDto: any, userId: string, companyId: string): Promise<HeadcountRequest> {
    const newHeadcountRequest = new this.headcountRequestModel({
      ...createHeadcountRequestDto,
      requestedBy: userId,
      companyId,
      status: HeadcountStatus.PENDING,
    });
    return newHeadcountRequest.save();
  }

  async findAll(filters: any = {}, companyId?: string): Promise<HeadcountRequest[]> {
    const query = companyId ? { ...filters, companyId } : filters;
    return this.headcountRequestModel
      .find(query)
      .populate('requestedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUser(userId: string, companyId?: string): Promise<HeadcountRequest[]> {
    return this.findAll({ requestedBy: userId }, companyId);
  }

  async findOne(id: string, companyId?: string): Promise<HeadcountRequest> {
    const query = companyId ? { _id: id, companyId } : { _id: id };
    const headcountRequest = await this.headcountRequestModel
      .findOne(query)
      .populate('requestedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .exec();
    
    if (!headcountRequest) {
      throw new NotFoundException(`Headcount request with ID ${id} not found`);
    }
    
    return headcountRequest;
  }

  async update(id: string, updateHeadcountRequestDto: any, companyId?: string): Promise<HeadcountRequest> {
    const query = companyId ? { _id: id, companyId } : { _id: id };
    const updatedHeadcountRequest = await this.headcountRequestModel
      .findOneAndUpdate(query, updateHeadcountRequestDto, { new: true })
      .exec();
    
    if (!updatedHeadcountRequest) {
      throw new NotFoundException(`Headcount request with ID ${id} not found`);
    }
    
    return updatedHeadcountRequest;
  }

  async approve(id: string, userId: string, companyId: string, reviewNotes?: string): Promise<HeadcountRequest> {
    const headcountRequest = await this.findOne(id, companyId);
    
    if (headcountRequest.status !== HeadcountStatus.PENDING) {
      throw new ForbiddenException('This headcount request has already been reviewed');
    }
    
    return this.update(id, {
      status: HeadcountStatus.APPROVED,
      reviewedBy: userId,
      reviewNotes,
      reviewedAt: new Date(),
    }, companyId);
  }

  async reject(id: string, userId: string, companyId: string, reviewNotes?: string): Promise<HeadcountRequest> {
    const headcountRequest = await this.findOne(id, companyId);
    
    if (headcountRequest.status !== HeadcountStatus.PENDING) {
      throw new ForbiddenException('This headcount request has already been reviewed');
    }
    
    return this.update(id, {
      status: HeadcountStatus.REJECTED,
      reviewedBy: userId,
      reviewNotes,
      reviewedAt: new Date(),
    }, companyId);
  }

  async remove(id: string, companyId?: string): Promise<void> {
    const query = companyId ? { _id: id, companyId } : { _id: id };
    const result = await this.headcountRequestModel.deleteOne(query).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Headcount request with ID ${id} not found`);
    }
  }
}
