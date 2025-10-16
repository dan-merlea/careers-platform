import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  companyName: string;
  logo?: string;
  website?: string;
  industry?: string;
  description?: string;
  location?: string;
  size?: string;
  founded?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema({
  companyName: { type: String, required: true },
  logo: String,
  website: String,
  industry: String,
  description: String,
  location: String,
  size: String,
  founded: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { 
  timestamps: true,
  collection: 'companies'
});

export default mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);
