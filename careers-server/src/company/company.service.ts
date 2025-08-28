import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company } from './company.schema';
import { CompanyDto } from './dto/company.dto';
import { JobFunctionService } from './job-function.service';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name) private readonly companyModel: Model<Company>,
    private readonly jobFunctionService: JobFunctionService,
  ) {}

  /**
   * Get company details
   * There should only be one company record in the database
   */
  async getCompanyDetails(): Promise<Company> {
    // Find the first company record
    const company = await this.companyModel.findOne().exec();

    if (!company) {
      throw new Error('Company details not found');
    }

    return company;
  }

  /**
   * Create or update company details
   */
  async saveCompanyDetails(companyDto: CompanyDto): Promise<Company> {
    // Check if company details already exist
    const existingCompany = await this.companyModel.findOne().exec();

    if (existingCompany) {
      // Update existing company
      const updated = await this.companyModel
        .findByIdAndUpdate(existingCompany._id, companyDto, { new: true })
        .exec();

      if (!updated) {
        throw new Error('Failed to update company details');
      }

      return updated;
    } else {
      // Create new company
      const newCompany = new this.companyModel(companyDto);
      const savedCompany = await newCompany.save();

      // Create default job functions for the new company
      await this.jobFunctionService.createDefaultJobFunctions(
        savedCompany.id as string,
      );

      return savedCompany;
    }
  }
}
