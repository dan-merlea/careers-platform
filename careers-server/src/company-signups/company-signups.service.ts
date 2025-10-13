import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CompanySignup, CompanySignupDocument } from './schemas/company-signup.schema';
import { CreateCompanySignupDto } from './dto/create-company-signup.dto';

@Injectable()
export class CompanySignupsService {
  constructor(
    @InjectModel(CompanySignup.name)
    private companySignupModel: Model<CompanySignupDocument>,
  ) {}

  async create(createDto: CreateCompanySignupDto): Promise<CompanySignup> {
    const signup = new this.companySignupModel(createDto);
    return signup.save();
  }

  async findAll(): Promise<CompanySignup[]> {
    return this.companySignupModel.find().sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<CompanySignup | null> {
    return this.companySignupModel.findById(id).exec();
  }

  async updateStatus(
    id: string,
    status: string,
    userId?: string,
  ): Promise<CompanySignup | null> {
    const update: any = { status };
    
    if (status === 'approved' && userId) {
      update.approvedBy = userId;
      update.approvedAt = new Date();
    }

    return this.companySignupModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
  }

  async addNotes(id: string, notes: string): Promise<CompanySignup | null> {
    return this.companySignupModel
      .findByIdAndUpdate(id, { notes }, { new: true })
      .exec();
  }
}
