import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { JobStatus } from './job.model';
import { JobBoard } from '../job-boards/schemas/job-board.schema';

export type JobDocument = Job & Document;

@Schema({ timestamps: true })
export class Job {
  @Prop({ required: false })
  internalId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  companyId: any; // Reference to Company

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'HeadcountRequest' })
  headcountRequestId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  location: string;

  @Prop()
  publishedDate: Date;

  @Prop({ required: true })
  content: string;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Department' }])
  departments: any[]; // Reference to Department[]

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Office' }])
  offices: any[]; // Reference to Office[]

  @Prop({
    type: String,
    enum: Object.values(JobStatus),
    default: JobStatus.DRAFT,
  })
  status: JobStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'JobBoard' })
  jobBoardId: JobBoard;

  @Prop({ type: String, default: null })
  approvedBy: string;

  @Prop({ type: Date, default: null })
  approvedAt: Date;

  @Prop({ type: String, default: null })
  rejectedBy: string;

  @Prop({ type: String, default: null })
  rejectionReason: string;

  @Prop({ type: Date, default: null })
  rejectedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  hiringManagerId: MongooseSchema.Types.ObjectId | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'JobRole', default: null })
  roleId?: MongooseSchema.Types.ObjectId;

  @Prop()
  externalId?: string;

  @Prop()
  externalUrl?: string;

  // These will be automatically added by the timestamps: true option
  createdAt: Date;
  updatedAt: Date;
}

export const JobSchema = SchemaFactory.createForClass(Job);
