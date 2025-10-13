import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CompanySignupDocument = CompanySignup & Document;

@Schema({ timestamps: true })
export class CompanySignup {
  @Prop({ required: true })
  companyName: string;

  @Prop({ required: true })
  companySize: string; // e.g., "1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"

  @Prop({ required: true })
  industry: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  website: string;

  @Prop({ required: true })
  contactFirstName: string;

  @Prop({ required: true })
  contactLastName: string;

  @Prop({ required: true })
  contactEmail: string;

  @Prop({ required: true })
  contactPhone: string;

  @Prop({ required: true })
  jobTitle: string;

  @Prop()
  hiringNeeds: string; // Description of their hiring needs

  @Prop()
  expectedHires: string; // e.g., "1-5", "6-10", "11-20", "20+"

  @Prop({ default: 'pending' })
  status: string; // pending, approved, rejected

  @Prop()
  notes: string; // Internal notes about the signup

  @Prop()
  approvedBy: string; // User ID who approved

  @Prop()
  approvedAt: Date;
}

export const CompanySignupSchema = SchemaFactory.createForClass(CompanySignup);
