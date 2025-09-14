import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CalendarCredentials, CalendarCredentialsDocument } from './schemas/calendar-credentials.schema';
import { CalendarCredentialsDto, CalendarIntegrationType } from './dto/calendar-credentials.dto';

@Injectable()
export class CalendarCredentialsService {
  constructor(
    @InjectModel(CalendarCredentials.name)
    private calendarCredentialsModel: Model<CalendarCredentialsDocument>,
  ) {}

  /**
   * Get all calendar credentials
   */
  async findAll(): Promise<CalendarCredentials[]> {
    return this.calendarCredentialsModel.find().exec();
  }

  /**
   * Get calendar credentials by type
   */
  async findByType(type: CalendarIntegrationType): Promise<CalendarCredentials> {
    const credentials = await this.calendarCredentialsModel.findOne({ type }).exec();
    
    if (!credentials) {
      throw new NotFoundException(`Calendar credentials for ${type} not found`);
    }
    
    return credentials;
  }

  /**
   * Save calendar credentials
   */
  async save(credentialsDto: CalendarCredentialsDto): Promise<CalendarCredentials> {
    const { type } = credentialsDto;
    
    // Check if credentials already exist for this type
    const existingCredentials = await this.calendarCredentialsModel.findOne({ type }).exec();
    
    if (existingCredentials) {
      // Update existing credentials
      Object.assign(existingCredentials, credentialsDto);
      return existingCredentials.save();
    } else {
      // Create new credentials
      const newCredentials = new this.calendarCredentialsModel(credentialsDto);
      return newCredentials.save();
    }
  }

  /**
   * Delete calendar credentials
   */
  async delete(type: CalendarIntegrationType): Promise<void> {
    const result = await this.calendarCredentialsModel.deleteOne({ type }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Calendar credentials for ${type} not found`);
    }
  }
}
