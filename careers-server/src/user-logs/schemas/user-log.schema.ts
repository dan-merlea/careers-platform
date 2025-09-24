import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserLogDocument = UserLog & Document;

@Schema({ timestamps: true })
export class UserLog {
  @Prop({ required: true })
  userId: string;

  @Prop()
  userName?: string;

  @Prop()
  userEmail?: string;

  @Prop({ required: true })
  action: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  details: Record<string, any>;

  @Prop({ required: true })
  resourceType: string;

  @Prop()
  resourceId?: string;

  @Prop()
  ip?: string;

  @Prop()
  userAgent?: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserLogSchema = SchemaFactory.createForClass(UserLog);
