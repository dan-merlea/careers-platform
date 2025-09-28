import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model, Types } from 'mongoose';
import {
  AnalyticsMetrics,
  AnalyticsMetricsDocument,
} from '../schemas/analytics-metrics.schema';
import {
  JobApplication,
  JobApplicationDocument,
} from '../../job-applications/schemas/job-application.schema';
import { User } from '../../users/schemas/user.schema';

@Injectable()
export class AnalyticsAggregatorService {
  private readonly logger = new Logger(AnalyticsAggregatorService.name);

  constructor(
    @InjectModel(AnalyticsMetrics.name)
    private readonly metricsModel: Model<AnalyticsMetricsDocument>,
    @InjectModel(JobApplication.name)
    private readonly jobApplicationModel: Model<JobApplicationDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  /**
   * Run daily at midnight to compute all metrics
   */
  @Cron('0 0 * * *')
  async aggregateAllMetrics() {
    this.logger.log('Starting daily analytics aggregation');

    try {
      const companies = await this.getActiveCompanies();

      for (const company of companies) {
        await Promise.all([
          this.aggregateKpiMetrics(company.id),
          this.aggregateApplicationTrends(company.id),
          this.aggregateJobPerformance(company.id),
          this.aggregateSourceEffectiveness(company.id),
        ]);
      }

      this.logger.log('Daily analytics aggregation completed');
    } catch (error) {
      this.logger.error(
        `Error in daily analytics aggregation: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Run hourly for medium-priority updates
   */
  @Cron('0 * * * *')
  async aggregateRecentMetrics() {
    this.logger.log('Starting hourly analytics update');

    try {
      const companies = await this.getActiveCompanies();

      for (const company of companies) {
        // Only update KPIs hourly as they're most important
        await this.aggregateKpiMetrics(company.id);
      }

      this.logger.log('Hourly analytics update completed');
    } catch (error) {
      this.logger.error(
        `Error in hourly analytics update: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Aggregate KPI metrics for a company
   */
  async aggregateKpiMetrics(companyId: string) {
    this.logger.log(`Aggregating KPI metrics for company ${companyId}`);

    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Calculate total applications
    const totalApplications = await this.calculateTotalApplications(
      companyId,
      thirtyDaysAgo,
      today,
    );

    // Calculate active candidates
    const activeCandidates = await this.calculateActiveCandidates(companyId);

    // Calculate time to hire
    const timeToHire = await this.calculateAverageTimeToHire(
      companyId,
      thirtyDaysAgo,
      today,
    );

    // Calculate conversion rate
    const conversionRate = await this.calculateConversionRate(
      companyId,
      thirtyDaysAgo,
      today,
    );

    // Store metrics with previous period comparison
    await this.storeKpiMetric(
      companyId,
      'total_applications',
      totalApplications,
      thirtyDaysAgo,
      today,
    );
    await this.storeKpiMetric(
      companyId,
      'active_candidates',
      activeCandidates,
      thirtyDaysAgo,
      today,
    );
    await this.storeKpiMetric(
      companyId,
      'time_to_hire',
      timeToHire,
      thirtyDaysAgo,
      today,
    );
    await this.storeKpiMetric(
      companyId,
      'conversion_rate',
      conversionRate,
      thirtyDaysAgo,
      today,
    );
  }

  /**
   * Aggregate application trends for a company
   */
  async aggregateApplicationTrends(companyId: string) {
    this.logger.log(`Aggregating application trends for company ${companyId}`);

    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get daily application counts for the last 30 days
    const dailyTrends = await this.calculateDailyApplicationTrends(
      companyId,
      thirtyDaysAgo,
      today,
    );

    // Store the trend data
    await this.storeTrendMetric(
      companyId,
      'application_trend',
      0,
      thirtyDaysAgo,
      today,
      dailyTrends,
    );
  }

  /**
   * Aggregate job performance metrics for a company
   */
  async aggregateJobPerformance(companyId: string) {
    this.logger.log(`Aggregating job performance for company ${companyId}`);

    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get top performing jobs
    const topJobs = await this.calculateTopPerformingJobs(
      companyId,
      thirtyDaysAgo,
      today,
    );

    // Store the job performance data
    await this.storeTrendMetric(
      companyId,
      'top_jobs',
      0,
      thirtyDaysAgo,
      today,
      topJobs,
    );
  }

  /**
   * Aggregate source effectiveness metrics for a company
   */
  async aggregateSourceEffectiveness(companyId: string) {
    this.logger.log(
      `Aggregating source effectiveness for company ${companyId}`,
    );

    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get source effectiveness data
    const sourceEffectiveness = await this.calculateSourceEffectiveness(
      companyId,
      thirtyDaysAgo,
      today,
    );

    // Store the source effectiveness data
    await this.storeTrendMetric(
      companyId,
      'source_effectiveness',
      0,
      thirtyDaysAgo,
      today,
      sourceEffectiveness,
    );
  }

  /**
   * Store a KPI metric with change calculation
   */
  private async storeKpiMetric(
    companyId: string,
    metricKey: string,
    value: number,
    periodStart: Date,
    periodEnd: Date,
  ) {
    // Calculate change compared to previous period
    const previousPeriodStart = new Date(periodStart);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);

    const previousPeriodEnd = new Date(periodEnd);
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 30);

    // Find previous period metric
    const previousMetric = await this.metricsModel
      .findOne({
        companyId,
        metricType: 'kpi',
        metricKey,
        periodStart: { $gte: previousPeriodStart },
        periodEnd: { $lte: previousPeriodEnd },
      })
      .sort({ date: -1 })
      .exec();

    // Calculate change percentage and trend
    let changePercentage = 0;
    let trend: 'up' | 'down' | 'neutral' = 'neutral';

    if (previousMetric) {
      const previousValue = previousMetric.value;

      if (previousValue > 0) {
        changePercentage = ((value - previousValue) / previousValue) * 100;
        trend =
          changePercentage > 0
            ? 'up'
            : changePercentage < 0
              ? 'down'
              : 'neutral';
      }
    }

    // Create new metric
    const newMetric = new this.metricsModel({
      metricType: 'kpi',
      metricKey,
      value,
      changePercentage,
      trend,
      date: new Date(),
      companyId,
      periodStart,
      periodEnd,
    });

    await newMetric.save();
  }

  /**
   * Store a trend metric
   */
  private async storeTrendMetric(
    companyId: string,
    metricKey: string,
    value: number,
    periodStart: Date,
    periodEnd: Date,
    additionalData: any,
  ) {
    // Create new metric
    const newMetric = new this.metricsModel({
      metricType: 'trend',
      metricKey,
      value,
      date: new Date(),
      additionalData,
      companyId,
      periodStart,
      periodEnd,
    });

    await newMetric.save();
  }

  /**
   * Get active companies
   * Uses real data from the user model to find companies
   */
  private async getActiveCompanies() {
    // Find all unique companies from the users collection
    const companies = await this.userModel
      .aggregate([
        {
          $match: {
            companyId: { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: '$companyId',
          },
        },
        {
          $project: {
            _id: 0,
            id: '$_id',
          },
        },
      ])
      .exec();

    return companies.length > 0 ? companies : [{ id: 'default' }];
  }

  /**
   * Calculate total applications
   * Uses real data from the job applications collection
   */
  private async calculateTotalApplications(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const count = await this.jobApplicationModel
      .countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
        // If your application has a companyId field, uncomment this
        // companyId: new Types.ObjectId(companyId)
      })
      .exec();

    return count;
  }

  /**
   * Calculate active candidates
   * Uses real data from the job applications collection
   */
  private async calculateActiveCandidates(companyId: string) {
    // Count applications that are not in terminal states (rejected, hired, withdrawn)
    const count = await this.jobApplicationModel
      .countDocuments({
        status: { $nin: ['rejected', 'hired', 'withdrawn'] },
        // If your application has a companyId field, uncomment this
        // companyId: new Types.ObjectId(companyId)
      })
      .exec();

    return count;
  }

  /**
   * Calculate average time to hire
   * Uses real data from the job applications collection
   */
  private async calculateAverageTimeToHire(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ) {
    // Find all applications that were hired within the date range
    const hiredApplications = await this.jobApplicationModel
      .find({
        status: 'hired',
        updatedAt: { $gte: startDate, $lte: endDate },
        // If your application has a companyId field, uncomment this
        // companyId: new Types.ObjectId(companyId)
      })
      .exec();

    if (hiredApplications.length === 0) {
      return 0; // No hires in this period
    }

    // Calculate the time to hire for each application
    let totalDays = 0;
    for (const app of hiredApplications) {
      const createdDate = new Date(app.createdAt);
      const hiredDate = new Date(app.updatedAt); // Assuming updatedAt reflects when status changed to hired
      const timeDiff = hiredDate.getTime() - createdDate.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
      totalDays += daysDiff;
    }

    // Return the average
    return Math.round(totalDays / hiredApplications.length);
  }

  /**
   * Calculate conversion rate
   * Uses real data from the job applications collection
   */
  private async calculateConversionRate(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ) {
    // Count total applications in the period
    const totalApplications = await this.jobApplicationModel
      .countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
        // If your application has a companyId field, uncomment this
        // companyId: new Types.ObjectId(companyId)
      })
      .exec();

    // Count hired applications in the period
    const hiredApplications = await this.jobApplicationModel
      .countDocuments({
        status: 'hired',
        updatedAt: { $gte: startDate, $lte: endDate },
        // If your application has a companyId field, uncomment this
        // companyId: new Types.ObjectId(companyId)
      })
      .exec();

    if (totalApplications === 0) {
      return 0;
    }

    // Calculate conversion rate as percentage
    return parseFloat(
      ((hiredApplications / totalApplications) * 100).toFixed(1),
    );
  }

  /**
   * Calculate daily application trends
   * Uses real data from the job applications collection
   */
  private async calculateDailyApplicationTrends(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ) {
    // Use MongoDB aggregation to group applications by date
    const dailyTrends = await this.jobApplicationModel
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            // If your application has a companyId field, uncomment this
            // companyId: new Types.ObjectId(companyId)
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: {
                  $dateFromParts: {
                    year: '$_id.year',
                    month: '$_id.month',
                    day: '$_id.day',
                  },
                },
              },
            },
            count: 1,
          },
        },
        { $sort: { date: 1 } },
      ])
      .exec();

    return dailyTrends;
  }

  /**
   * Calculate top performing jobs
   * Uses real data from the job applications collection
   */
  private async calculateTopPerformingJobs(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ) {
    // Use MongoDB aggregation to group applications by job and calculate metrics
    const jobPerformance = await this.jobApplicationModel
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            // If your application has a companyId field, uncomment this
            // companyId: new Types.ObjectId(companyId)
          },
        },
        {
          $lookup: {
            from: 'jobs', // The collection name for jobs
            localField: 'jobId',
            foreignField: '_id',
            as: 'jobDetails',
          },
        },
        {
          $unwind: '$jobDetails',
        },
        {
          $group: {
            _id: '$jobId',
            title: { $first: '$jobDetails.title' },
            applications: { $sum: 1 },
            hires: {
              $sum: {
                $cond: [{ $eq: ['$status', 'hired'] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            title: 1,
            applications: 1,
            conversionRate: {
              $cond: [
                { $eq: ['$applications', 0] },
                0,
                { $multiply: [{ $divide: ['$hires', '$applications'] }, 100] },
              ],
            },
          },
        },
        {
          $sort: { applications: -1 },
        },
        {
          $limit: 5,
        },
      ])
      .exec();

    // Format the conversion rate to one decimal place
    return jobPerformance.map((job) => ({
      ...job,
      conversionRate: parseFloat(job.conversionRate.toFixed(1)),
    }));
  }

  /**
   * Calculate source effectiveness
   * Uses real data from the job applications collection
   */
  private async calculateSourceEffectiveness(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ) {
    // Use MongoDB aggregation to group applications by source and calculate metrics
    const sourceEffectiveness = await this.jobApplicationModel
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            // If your application has a companyId field, uncomment this
            // companyId: new Types.ObjectId(companyId)
          },
        },
        {
          $group: {
            _id: '$source', // Assuming there's a source field in your applications
            applications: { $sum: 1 },
            hires: {
              $sum: {
                $cond: [{ $eq: ['$status', 'hired'] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            source: '$_id',
            applications: 1,
            conversionRate: {
              $cond: [
                { $eq: ['$applications', 0] },
                0,
                { $multiply: [{ $divide: ['$hires', '$applications'] }, 100] },
              ],
            },
          },
        },
        {
          $sort: { applications: -1 },
        },
      ])
      .exec();

    // Handle the case where source might be null or undefined
    return sourceEffectiveness.map((item) => ({
      source: item.source || 'careers-page',
      applications: item.applications,
      conversionRate: parseFloat(item.conversionRate.toFixed(1)),
    }));
  }

  /**
   * Real-time update methods for use by interceptors
   */

  /**
   * Increment application count when a new application is created
   */
  async incrementApplicationCount(
    companyId: string,
    jobId?: string,
    source?: string,
  ) {
    this.logger.log(`Incrementing application count for company ${companyId}`);

    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Update total applications KPI
    const totalApplicationsMetric = await this.metricsModel
      .findOne({
        companyId,
        metricType: 'kpi',
        metricKey: 'total_applications',
        periodStart: { $gte: thirtyDaysAgo },
        periodEnd: { $lte: today },
      })
      .sort({ date: -1 })
      .exec();

    if (totalApplicationsMetric) {
      totalApplicationsMetric.value += 1;
      await totalApplicationsMetric.save();
    }

    // Update application trend
    const trendMetric = await this.metricsModel
      .findOne({
        companyId,
        metricType: 'trend',
        metricKey: 'application_trend',
        periodStart: { $gte: thirtyDaysAgo },
        periodEnd: { $lte: today },
      })
      .sort({ date: -1 })
      .exec();

    if (trendMetric && trendMetric.additionalData) {
      const todayStr = today.toISOString().split('T')[0];
      const trendData = trendMetric.additionalData;

      // Find today's entry or create it
      const todayEntry = trendData.find((entry) => entry.date === todayStr);
      if (todayEntry) {
        todayEntry.count += 1;
      } else {
        trendData.push({ date: todayStr, count: 1 });
      }

      trendMetric.additionalData = trendData;
      await trendMetric.save();
    }

    // If jobId is provided, update job performance
    if (jobId) {
      await this.updateJobApplicationCount(companyId, jobId);
    }

    // If source is provided, update source effectiveness
    if (source) {
      await this.updateSourceApplicationCount(companyId, source);
    }
  }

  /**
   * Update job application count
   */
  private async updateJobApplicationCount(companyId: string, jobId: string) {
    // Implementation for updating job application count
  }

  /**
   * Update source application count
   */
  private async updateSourceApplicationCount(
    companyId: string,
    source: string,
  ) {
    this.logger.log(`Updating source application count for source ${source}`);

    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get current source effectiveness metrics
    const sourceMetric = await this.metricsModel
      .findOne({
        companyId,
        metricType: 'trend',
        metricKey: 'source_effectiveness',
        periodStart: { $gte: thirtyDaysAgo },
        periodEnd: { $lte: today },
      })
      .sort({ date: -1 })
      .exec();

    if (sourceMetric && sourceMetric.additionalData) {
      // Type assertion for additionalData
      interface SourceData {
        source: string;
        applications: number;
        hires: number;
        conversionRate: number;
      }

      const sourceData = sourceMetric.additionalData as SourceData[];

      // Find source entry or create it
      const sourceEntry = sourceData.find((entry) => entry.source === source);
      if (sourceEntry) {
        sourceEntry.applications += 1;
        // Recalculate conversion rate if there are hires
        if (sourceEntry.hires > 0) {
          sourceEntry.conversionRate = parseFloat(
            ((sourceEntry.hires / sourceEntry.applications) * 100).toFixed(1),
          );
        }
      } else {
        sourceData.push({
          source,
          applications: 1,
          hires: 0,
          conversionRate: 0,
        });
      }

      sourceMetric.additionalData = sourceData;
      await sourceMetric.save();
    }
  }
}
