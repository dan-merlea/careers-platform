import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ApiKeyDocument = ApiKey & Document;

export enum IntegrationType {
  GREENHOUSE = 'greenhouse',
  ASHBY = 'ashby',
}

@Schema({ timestamps: true })
export class ApiKey {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: IntegrationType })
  type: IntegrationType;

  @Prop({ required: true })
  apiKey: string;

  @Prop()
  apiSecret?: string;

  @Prop()
  baseUrl?: string;

  @Prop()
  companyReference?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  companyId: MongooseSchema.Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);
