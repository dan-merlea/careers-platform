import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type InterviewProcessDocument = InterviewProcess & Document;

@Schema({ timestamps: true })
export class InterviewStage {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  considerations: string[];

  @Prop({ required: true })
  emailTemplate: string;

  @Prop({ default: 0 })
  order: number;
}

export const InterviewStageSchema = SchemaFactory.createForClass(InterviewStage);


@Schema({ timestamps: true })
export class InterviewProcess {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'JobRole', required: true })
  jobRoleId: MongooseSchema.Types.ObjectId;

  @Prop({ type: [InterviewStageSchema], default: [] })
  stages: InterviewStage[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  companyId: MongooseSchema.Types.ObjectId;

  // These will be automatically added by the timestamps: true option
  createdAt: Date;
  updatedAt: Date;
}

export const InterviewProcessSchema = SchemaFactory.createForClass(InterviewProcess);

