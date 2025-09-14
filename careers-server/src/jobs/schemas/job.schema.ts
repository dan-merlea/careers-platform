import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type JobDocument = Job & Document;

@Schema({ timestamps: true })
export class Job {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Department' })
  departmentId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Office' })
  officeId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'JobRole' })
  roleId: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const JobSchema = SchemaFactory.createForClass(Job);
