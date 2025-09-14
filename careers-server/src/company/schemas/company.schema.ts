import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CompanyDocument = Company & Document;

@Schema({ timestamps: true })
export class Company {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  website: string;

  @Prop()
  logo_url: string;

  @Prop()
  founded_year: number;

  @Prop()
  size: string;

  @Prop()
  industry: string;

  @Prop()
  headquarters: string;

  @Prop({ type: Object })
  social_media: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };

  @Prop({ type: Object, default: { approvalType: 'headcount', emailCalendarProvider: 'other' } })
  settings: {
    approvalType: 'headcount' | 'job-opening';
    emailCalendarProvider: 'google' | 'microsoft' | 'other';
  };

  // Virtual field for jobs - will be populated when needed
  // Mongoose will handle this relationship differently than TypeORM

  // These will be automatically added by the timestamps: true option
  createdAt: Date;
  updatedAt: Date;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
