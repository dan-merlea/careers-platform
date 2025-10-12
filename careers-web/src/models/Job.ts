import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  title: string;
  companyId: mongoose.Types.ObjectId;
  status: string;
}

const JobSchema = new Schema({
  title: { type: String, required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  status: String,
}, { 
  collection: 'jobs' // Use the same collection name as careers-server
});

export default mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);
