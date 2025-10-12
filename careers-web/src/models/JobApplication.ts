import mongoose, { Schema, Document } from 'mongoose';

export interface TimeSlot {
  date: Date;
  startTime: string; // Format: "HH:mm"
  endTime: string;   // Format: "HH:mm"
  timezone: string;  // IANA timezone (e.g., "America/New_York")
}

export interface IJobApplication extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  status: string;
  availableTimeSlots?: TimeSlot[];
  createdAt: Date;
  updatedAt: Date;
}

const TimeSlotSchema = new Schema({
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  timezone: { type: String, required: true },
});

const JobApplicationSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  status: { type: String, required: true },
  availableTimeSlots: [TimeSlotSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { 
  timestamps: true,
  collection: 'jobapplications' // Use the same collection name as careers-server
});

export default mongoose.models.JobApplication || mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);
