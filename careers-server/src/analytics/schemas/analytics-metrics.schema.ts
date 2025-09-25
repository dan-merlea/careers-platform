import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AnalyticsMetricsDocument = AnalyticsMetrics & Document;

@Schema({ timestamps: true })
export class AnalyticsMetrics {
  @Prop({ required: true })
  metricType: string; // 'kpi', 'trend', 'job_performance', 'source_effectiveness'
  
  @Prop({ required: true })
  metricKey: string; // 'total_applications', 'active_candidates', etc.
  
  @Prop({ required: true })
  value: number;
  
  @Prop()
  changePercentage: number;
  
  @Prop()
  trend: string; // 'up', 'down', 'neutral'
  
  @Prop({ required: true })
  date: Date;
  
  @Prop({ type: MongooseSchema.Types.Mixed })
  additionalData: any; // For storing complex data like trend points
  
  @Prop({ required: true, index: true })
  companyId: string;
  
  @Prop()
  departmentId: string;
  
  @Prop()
  jobId: string;
  
  @Prop()
  sourceId: string;
  
  @Prop()
  periodStart: Date;
  
  @Prop()
  periodEnd: Date;
}

export const AnalyticsMetricsSchema = SchemaFactory.createForClass(AnalyticsMetrics);

// Create compound indexes for efficient querying
AnalyticsMetricsSchema.index({ companyId: 1, metricType: 1, metricKey: 1, date: -1 });
AnalyticsMetricsSchema.index({ companyId: 1, departmentId: 1, metricType: 1, date: -1 });
AnalyticsMetricsSchema.index({ companyId: 1, jobId: 1, metricType: 1, date: -1 });
