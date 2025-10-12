import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company } from './company.schema';
import { CompanyDto } from './dto/company.dto';
import { CompanySettingsDto } from './dto/company-settings.dto';
import { JobFunctionService } from './job-function.service';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name) private readonly companyModel: Model<Company>,
    private readonly jobFunctionService: JobFunctionService,
  ) {}

  /**
   * Get company details by ID
   */
  async getCompanyDetails(companyId: string): Promise<Company> {
    const company = await this.companyModel.findById(companyId).exec();

    if (!company) {
      throw new Error('Company details not found');
    }

    return company;
  }

  /**
   * Create or update company details
   */
  async saveCompanyDetails(companyId: string, companyDto: CompanyDto): Promise<Company> {
    // Check if company details already exist
    const existingCompany = await this.companyModel.findById(companyId).exec();

    if (existingCompany) {
      // Update existing company
      const updated = await this.companyModel
        .findByIdAndUpdate(companyId, companyDto, { new: true })
        .exec();

      if (!updated) {
        throw new Error('Failed to update company details');
      }

      return updated;
    } else {
      // Create new company with the provided ID
      const newCompany = new this.companyModel({ ...companyDto, _id: companyId });
      const savedCompany = await newCompany.save();

      // Create default job functions for the new company
      await this.jobFunctionService.createDefaultJobFunctions(
        savedCompany.id as string,
      );

      return savedCompany;
    }
  }

  /**
   * Update company settings
   */
  async updateCompanySettings(
    companyId: string,
    settingsDto: CompanySettingsDto,
  ): Promise<Company> {
    // Get existing company
    const company = await this.getCompanyDetails(companyId);

    // Update settings
    const currentSettings = company.settings || {};
    const updatedSettings = { ...currentSettings, ...settingsDto };

    // Build update object
    const updatePayload: any = {
      $set: {
        'settings.approvalType': updatedSettings.approvalType,
        'settings.emailCalendarProvider': updatedSettings.emailCalendarProvider,
      },
    };

    // Optionally update allowedDomains if provided
    if (Array.isArray(settingsDto.allowedDomains)) {
      updatePayload.$set.allowedDomains = settingsDto.allowedDomains.map((d) => d.toLowerCase());
    }

    // Update company with new settings and optional allowedDomains
    const updated = await this.companyModel
      .findByIdAndUpdate(company._id, updatePayload, { new: true })
      .exec();

    if (!updated) {
      throw new Error('Failed to update company settings');
    }

    return updated;
  }
}
