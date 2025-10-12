import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type InterviewProcessDocument = InterviewProcess & Document;

@Schema()
export class Consideration {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;
}

export const ConsiderationSchema = SchemaFactory.createForClass(Consideration);

@Schema({ timestamps: true })
export class InterviewStage {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [ConsiderationSchema], default: [] })
  considerations: Consideration[];

  @Prop({ required: true })
  emailTemplate: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: 60 })
  durationMinutes: number; // Duration in minutes (must be multiple of 15)
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

