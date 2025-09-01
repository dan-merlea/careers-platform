import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum HeadcountStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class HeadcountRequest extends Document {
  @Prop({ required: true })
  role: string;

  @Prop({ required: true })
  department: string;

  @Prop({ required: true })
  teamName: string;

  @Prop({ required: true })
  reason: string;

  @Prop({ 
    type: String, 
    enum: HeadcountStatus, 
    default: HeadcountStatus.PENDING 
  })
  status: HeadcountStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  requestedBy: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  reviewedBy: string;

  @Prop()
  reviewNotes: string;

  @Prop()
  reviewedAt: Date;
}

export const HeadcountRequestSchema = SchemaFactory.createForClass(HeadcountRequest);
