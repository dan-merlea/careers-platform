import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { JobFunction } from './job-function.schema';

export type JobRoleDocument = JobRole & Document;

@Schema({ timestamps: true })
export class JobRole {
  @Prop({ required: true })
  title: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'JobFunction',
    required: true,
  })
  jobFunction: JobFunction;
}

export const JobRoleSchema = SchemaFactory.createForClass(JobRole);

// Ensure virtuals are included in JSON output
JobRoleSchema.set('toJSON', { virtuals: true });
JobRoleSchema.set('toObject', { virtuals: true });
