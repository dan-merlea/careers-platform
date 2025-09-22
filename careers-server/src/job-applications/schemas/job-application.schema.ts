import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

// Define a sub-schema for interviewers
export class Interviewer {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;
}

// Define a sub-schema for interviews
export class Interview {
  _id?: Types.ObjectId;

  @Prop({ required: true })
  scheduledDate: Date;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ default: '' })
  stage: string;

  @Prop({ default: '' })
  status: string;

  @Prop()
  cancellationReason?: string;

  @Prop()
  location?: string;

  @Prop()
  onlineMeetingUrl?: string;

  @Prop()
  meetingId?: string;

  @Prop()
  meetingPassword?: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'InterviewProcess',
  })
  processId?: Types.ObjectId;

  @Prop({
    type: [
      {
        userId: {
          type: MongooseSchema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        name: { type: String, required: true },
      },
    ],
    default: [],
  })
  interviewers: Interviewer[];

  @Prop({
    type: [
      {
        interviewerId: { type: String, required: true },
        interviewerName: { type: String, required: true },
        rating: { type: Number, required: true },
        comments: { type: String },
        decision: { type: String },
        considerations: { type: Object },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  feedback?: any[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

// Define a sub-schema for user notes
export class UserNote {
  _id?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export type JobApplicationDocument = JobApplication & Document;

@Schema({ timestamps: true })
export class JobApplication {
  _id?: Types.ObjectId;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop()
  linkedin?: string;

  @Prop()
  website?: string;

  @Prop({ required: true })
  resumeId: string;

  @Prop({ required: true })
  resumeFilename: string;

  @Prop({ required: true })
  resumeMimeType: string;

  @Prop({ required: true, type: Number })
  consentDuration: number; // Duration in months

  @Prop({ type: Date })
  consentExpiresAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Job', required: true })
  jobId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String })
  status: string;

  @Prop({ type: Boolean, default: false })
  interviewerVisibility: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  refereeId?: Types.ObjectId;

  @Prop()
  refereeName?: string;

  @Prop()
  refereeEmail?: string;

  @Prop()
  refereeRelationship?: string;

  @Prop({ type: Boolean, default: false })
  isReferral: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({
    type: [
      {
        userId: { type: MongooseSchema.Types.ObjectId, ref: 'User' },
        content: String,
        createdAt: Date,
        updatedAt: Date,
      },
    ],
    default: [],
  })
  userNotes: UserNote[];

  @Prop({
    type: [
      {
        scheduledDate: { type: Date, required: true },
        title: { type: String, required: true },
        description: String,
        stage: { type: String, default: '' },
        status: { type: String, default: '' },
        cancellationReason: String,
        processId: {
          type: MongooseSchema.Types.ObjectId,
          ref: 'InterviewProcess',
        },
        interviewers: [
          {
            userId: {
              type: MongooseSchema.Types.ObjectId,
              ref: 'User',
              required: true,
            },
            name: { type: String, required: true },
          },
        ],
        feedback: [
          {
            interviewerId: { type: String, required: true },
            interviewerName: { type: String, required: true },
            rating: { type: Number, required: true },
            comments: { type: String },
            decision: { type: String },
            considerations: { type: Object },
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now },
          },
        ],
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  interviews: Interview[];
}

export const JobApplicationSchema =
  SchemaFactory.createForClass(JobApplication);
