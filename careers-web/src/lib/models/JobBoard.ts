import mongoose, { Schema, Document } from 'mongoose';

export interface IJobBoard extends Document {
  _id: string;
  companyId: string;
  title: string;
  description?: string;
  isExternal: boolean;
  source: 'greenhouse' | 'ashby' | 'custom';
  externalId?: string;
  settings?: Record<string, unknown>;
  isActive: boolean;
  slug?: string;
  customDomain?: string;
  customDomainVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JobBoardSchema = new Schema<IJobBoard>(
  {
    companyId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    isExternal: { type: Boolean, default: false },
    source: { type: String, enum: ['greenhouse', 'ashby', 'custom'], default: 'custom' },
    externalId: { type: String },
    settings: { type: Schema.Types.Mixed },
    isActive: { type: Boolean, default: true },
    slug: { type: String },
    customDomain: { type: String },
    customDomainVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Create indexes
JobBoardSchema.index({ slug: 1 });
JobBoardSchema.index({ customDomain: 1, customDomainVerified: 1 });

export default mongoose.models.JobBoard || mongoose.model<IJobBoard>('JobBoard', JobBoardSchema);
