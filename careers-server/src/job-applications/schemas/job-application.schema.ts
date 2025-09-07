import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type JobApplicationDocument = JobApplication & Document;

@Schema({ timestamps: true })
export class JobApplication {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop()
  linkedin?: string;

  @Prop()
  website?: string;

  @Prop({ required: true })
  resumeId: string;

  @Prop({ required: true })
  resumeFilename: string;

  @Prop({ required: true })
  resumeMimeType: string;

  @Prop({ required: true, type: Number })
  consentDuration: number; // Duration in months

  @Prop({ type: Date })
  consentExpiresAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Job', required: true })
  jobId: MongooseSchema.Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const JobApplicationSchema = SchemaFactory.createForClass(JobApplication);
