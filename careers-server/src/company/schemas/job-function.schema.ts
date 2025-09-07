import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Company } from './company.schema';

export type JobFunctionDocument = JobFunction & Document;

@Schema({ timestamps: true })
export class JobFunction {
  @Prop({ required: true })
  title: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Company',
    required: true,
  })
  companyId: Company;
}

export const JobFunctionSchema = SchemaFactory.createForClass(JobFunction);

// Ensure virtuals are included in JSON output
JobFunctionSchema.set('toJSON', { virtuals: true });
JobFunctionSchema.set('toObject', { virtuals: true });
