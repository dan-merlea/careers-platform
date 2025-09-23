import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  JOB_APPLICATION = 'job_application',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  INTERVIEW_FEEDBACK = 'interview_feedback',
  HEADCOUNT_REQUEST = 'headcount_request',
  SYSTEM = 'system',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  @Prop({ required: true, default: false })
  read: boolean;

  @Prop({ type: MongooseSchema.Types.Mixed })
  data: Record<string, any>;

  @Prop({ type: String, ref: 'User' })
  createdBy?: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
