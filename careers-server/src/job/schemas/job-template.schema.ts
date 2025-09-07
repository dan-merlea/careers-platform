import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type JobTemplateDocument = JobTemplate & Document;

@Schema({ timestamps: true })
export class JobTemplate {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  role: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Company',
    required: true,
  })
  companyId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Department' })
  department: MongooseSchema.Types.ObjectId;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const JobTemplateSchema = SchemaFactory.createForClass(JobTemplate);
