import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type JobBoardDocument = JobBoard & Document;

@Schema({ timestamps: true })
export class JobBoard {
  @Prop({ required: true })
  title: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Company',
    required: true,
  })
  companyId: string;

  @Prop()
  description: string;

  @Prop({ default: false })
  isExternal: boolean;

  @Prop({ enum: ['greenhouse', 'ashby', 'custom'], default: 'custom' })
  source: string;

  @Prop()
  externalId: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  settings: Record<string, any>;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const JobBoardSchema = SchemaFactory.createForClass(JobBoard);
