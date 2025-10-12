import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CompanyApiKeyDocument = CompanyApiKey & Document;

@Schema({ timestamps: true })
export class CompanyApiKey {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  companyId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, unique: true })
  apiKey: string;

  @Prop({ required: true })
  secretKey: string; // Hashed

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastUsedAt?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: MongooseSchema.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const CompanyApiKeySchema = SchemaFactory.createForClass(CompanyApiKey);
