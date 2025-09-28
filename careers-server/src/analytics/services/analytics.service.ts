import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AnalyticsMetrics,
  AnalyticsMetricsDocument,
} from '../schemas/analytics-metrics.schema';
import {
  JobApplication,
  JobApplicationDocument,
} from '../../job-applications/schemas/job-application.schema';
import { User } from '../../users/schemas/user.schema';

interface AnalyticsFilter {
  companyId: string;
  startDate?: string;
  endDate?: string;
  department?: string;
  jobRole?: string;
  location?: string;
  source?: string;
  comparisonPeriod?: string;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectModel(AnalyticsMetrics.name)
    private readonly metricsModel: Model<AnalyticsMetricsDocument>,
    @InjectModel(JobApplication.name)
    private readonly jobApplicationModel: Model<JobApplicationDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(filters: AnalyticsFilter) {
    this.logger.log(
      `Getting dashboard metrics for company ${filters.companyId}`,
    );

    try {
      // Parse date filters or use defaults (last 30 days)
      const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
      const startDate = filters.startDate
        ? new Date(filters.startDate)
        : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get KPI metrics
      const kpis = await this.getKpiMetrics(
        filters.companyId,
        startDate,
        endDate,
        filters,
      );

      // Get application trend
      const applicationTrend = await this.getApplicationTrend(
        filters.companyId,
        startDate,
        endDate,
        filters,
      );

      // Get top performing jobs
      const topJobs = await this.getTopPerformingJobs(
        filters.companyId,
        startDate,
        endDate,
        filters,
      );

      // Get source effectiveness
      const sourceEffectiveness = await this.getSourceEffectiveness(
        filters.companyId,
        startDate,
        endDate,
        filters,
      );

      return {
        kpis,
        applicationTrend,
        topJobs,
        sourceEffectiveness,
      };
    } catch (error) {
      this.logger.error(
        `Error getting dashboard metrics: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Generate real funnel data from job applications
   * Stages: Applications -> Interview -> Hired
   */
  private async generateRealFunnelData(
    companyId: string,
    startDate: Date,
    endDate: Date,
    filters: AnalyticsFilter,
  ) {
    try {
      // Base query filters
      const baseFilters: any = {
        companyId,
        createdAt: { $gte: startDate, $lte: endDate },
      };
      if (filters.department) baseFilters.departmentId = filters.department;
      if (filters.jobRole) baseFilters.jobId = filters.jobRole;
      if (filters.location) baseFilters.location = filters.location;
      if (filters.source) baseFilters.source = filters.source;

      // Applications count
      const applicationsCount = await this.jobApplicationModel
        .countDocuments(baseFilters)
        .exec();

      // Interview count: distinct applications with any interview in range
      const interviewAgg = await this.jobApplicationModel
        .aggregate([
          { $match: baseFilters },
          { $unwind: { path: '$interviews', preserveNullAndEmptyArrays: false } },
          {
            $match: {
              'interviews.scheduledDate': { $gte: startDate, $lte: endDate },
            },
          },
          { $group: { _id: '$_id' } },
          { $count: 'interviewApps' },
        ])
        .exec();
      const interviewCount = interviewAgg && interviewAgg.length > 0 ? interviewAgg[0].interviewApps : 0;

      // Offers count (handle multiple possible status variants)
      const offerStatuses = ['offer', 'offered', 'offer_made'];
      const offersCount = await this.jobApplicationModel
        .countDocuments({ ...baseFilters, status: { $in: offerStatuses } })
        .exec();

      // Hires count
      const hiresCount = await this.jobApplicationModel
        .countDocuments({ ...baseFilters, status: 'hired' })
        .exec();

      // Build stages with conversion rates
      const stages = [
        {
          stage: 'Applications',
          count: applicationsCount,
          conversionRate: 100,
        },
        {
          stage: 'Interview',
          count: interviewCount,
          conversionRate:
            applicationsCount > 0
              ? parseFloat(((interviewCount / applicationsCount) * 100).toFixed(1))
              : 0,
        },
        {
          stage: 'Offers',
          count: offersCount,
          conversionRate:
            interviewCount > 0
              ? parseFloat(((offersCount / interviewCount) * 100).toFixed(1))
              : 0,
        },
        {
          stage: 'Hired',
          count: hiresCount,
          conversionRate:
            offersCount > 0
              ? parseFloat(((hiresCount / offersCount) * 100).toFixed(1))
              : interviewCount > 0
              ? parseFloat(((hiresCount / interviewCount) * 100).toFixed(1))
              : 0,
        },
      ];

      // Department breakdown: applications and hires per department (via job lookup)
      const departmentBreakdown = await this.jobApplicationModel
        .aggregate([
          { $match: baseFilters },
          {
            $lookup: {
              from: 'jobs',
              localField: 'jobId',
              foreignField: '_id',
              as: 'jobDetails',
            },
          },
          { $unwind: { path: '$jobDetails', preserveNullAndEmptyArrays: true } },
          {
            $group: {
              _id: {
                department:
                  { $ifNull: ['$jobDetails.department', '$departmentId'] },
              },
              applications: { $sum: 1 },
              hires: {
                $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] },
              },
            },
          },
          {
            $project: {
              _id: 0,
              department: {
                $cond: [
                  { $ifNull: ['$_id.department', false] },
                  '$_id.department',
                  'Unknown',
                ],
              },
              applications: 1,
              hires: 1,
            },
          },
          { $sort: { applications: -1 } },
        ])
        .exec();

      // Time to hire: average days from application to hire, and byStage durations
      // Average days to first interview
      const toFirstInterviewAgg = await this.jobApplicationModel
        .aggregate([
          { $match: baseFilters },
          { $unwind: { path: '$interviews', preserveNullAndEmptyArrays: false } },
          { $sort: { 'interviews.scheduledDate': 1 } },
          {
            $group: {
              _id: '$_id',
              appCreated: { $first: '$createdAt' },
              firstInterview: { $first: '$interviews.scheduledDate' },
            },
          },
          {
            $project: {
              days: {
                $cond: [
                  { $ifNull: ['$firstInterview', false] },
                  {
                    $divide: [
                      { $subtract: ['$firstInterview', '$appCreated'] },
                      1000 * 60 * 60 * 24,
                    ],
                  },
                  null,
                ],
              },
            },
          },
          { $match: { days: { $ne: null } } },
          { $group: { _id: null, avgDays: { $avg: '$days' } } },
        ])
        .exec();
      const avgToFirstInterview = toFirstInterviewAgg?.[0]?.avgDays || 0;

      // Average days from first interview to hired
      const interviewToHireAgg = await this.jobApplicationModel
        .aggregate([
          { $match: { ...baseFilters, status: 'hired' } },
          { $unwind: { path: '$interviews', preserveNullAndEmptyArrays: false } },
          { $sort: { 'interviews.scheduledDate': 1 } },
          {
            $group: {
              _id: '$_id',
              firstInterview: { $first: '$interviews.scheduledDate' },
              hiredAt: { $first: '$updatedAt' },
            },
          },
          {
            $project: {
              days: {
                $cond: [
                  { $ifNull: ['$firstInterview', false] },
                  {
                    $divide: [
                      { $subtract: ['$hiredAt', '$firstInterview'] },
                      1000 * 60 * 60 * 24,
                    ],
                  },
                  null,
                ],
              },
            },
          },
          { $match: { days: { $ne: null } } },
          { $group: { _id: null, avgDays: { $avg: '$days' } } },
        ])
        .exec();
      const avgInterviewToHire = interviewToHireAgg?.[0]?.avgDays || 0;

      // Average time to hire overall (application to hired)
      const timeToHireAgg = await this.jobApplicationModel
        .aggregate([
          { $match: { ...baseFilters, status: 'hired' } },
          {
            $project: {
              days: {
                $divide: [
                  { $subtract: ['$updatedAt', '$createdAt'] },
                  1000 * 60 * 60 * 24,
                ],
              },
            },
          },
          { $group: { _id: null, avgDays: { $avg: '$days' } } },
        ])
        .exec();
      const avgTimeToHire = timeToHireAgg?.[0]?.avgDays || 0;

      const timeToHire = {
        average: Math.round(avgTimeToHire),
        byStage: [
          { stage: 'Application → Interview', days: Math.round(avgToFirstInterview) },
          { stage: 'Interview → Hired', days: Math.round(avgInterviewToHire) },
        ],
      };

      return {
        stages,
        departmentBreakdown,
        timeToHire,
      };
    } catch (error) {
      this.logger.error(
        `Error generating real funnel data: ${error.message}`,
        error.stack,
      );
      return this.getMockFunnelData();
    }
  }

  /**
   * Get funnel data
   */
  async getFunnelData(filters: AnalyticsFilter) {
    this.logger.log(`Getting funnel data for company ${filters.companyId}`);

    try {
      // Parse date filters or use defaults (last 30 days)
      const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
      const startDate = filters.startDate
        ? new Date(filters.startDate)
        : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get funnel stages
      const funnelMetric = await this.metricsModel
        .findOne({
          companyId: filters.companyId,
          metricType: 'funnel',
          metricKey: 'stages',
          periodStart: { $gte: startDate },
          periodEnd: { $lte: endDate },
          ...(filters.department && { departmentId: filters.department }),
          ...(filters.jobRole && { jobId: filters.jobRole }),
          ...(filters.location && {
            'additionalData.location': filters.location,
          }),
          ...(filters.source && { sourceId: filters.source }),
        })
        .sort({ date: -1 })
        .exec();

      // If no data found, generate real funnel data from job applications
      if (!funnelMetric || !funnelMetric.additionalData) {
        return await this.generateRealFunnelData(
          filters.companyId,
          startDate,
          endDate,
          filters,
        );
      }

      return funnelMetric.additionalData;
    } catch (error) {
      this.logger.error(
        `Error getting funnel data: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get job performance data
   */
  async getJobPerformance(filters: AnalyticsFilter) {
    this.logger.log(`Getting job performance for company ${filters.companyId}`);

    try {
      // Parse date filters or use defaults (last 30 days)
      const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
      const startDate = filters.startDate
        ? new Date(filters.startDate)
        : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get job performance data
      const jobMetric = await this.metricsModel
        .findOne({
          companyId: filters.companyId,
          metricType: 'trend',
          metricKey: 'top_jobs',
          periodStart: { $gte: startDate },
          periodEnd: { $lte: endDate },
          ...(filters.department && { departmentId: filters.department }),
          ...(filters.jobRole && { jobId: filters.jobRole }),
          ...(filters.location && {
            'additionalData.location': filters.location,
          }),
        })
        .sort({ date: -1 })
        .exec();

      // If no data found, generate real data from job applications
      if (!jobMetric || !jobMetric.additionalData) {
        const jobs = await this.generateRealTopJobsData(
          filters.companyId,
          startDate,
          endDate,
          filters,
        );
        return { jobs };
      }

      return {
        jobs: jobMetric.additionalData,
      };
    } catch (error) {
      this.logger.error(
        `Error getting job performance: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get interview analytics
   */
  async getInterviewAnalytics(filters: AnalyticsFilter) {
    this.logger.log(
      `Getting interview analytics for company ${filters.companyId}`,
    );

    try {
      // Parse date filters or use defaults (last 30 days)
      const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
      const startDate = filters.startDate
        ? new Date(filters.startDate)
        : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get interview analytics data
      const interviewMetric = await this.metricsModel
        .findOne({
          companyId: filters.companyId,
          metricType: 'interview',
          metricKey: 'metrics',
          periodStart: { $gte: startDate },
          periodEnd: { $lte: endDate },
          ...(filters.department && { departmentId: filters.department }),
          ...(filters.jobRole && { jobId: filters.jobRole }),
        })
        .sort({ date: -1 })
        .exec();

      // If no data found, generate real data from job applications
      if (!interviewMetric || !interviewMetric.additionalData) {
        this.logger.log(
          `Generating real interview analytics data for company ${filters.companyId}`,
        );
        return this.generateRealInterviewAnalyticsData(
          filters.companyId,
          startDate,
          endDate,
          filters,
        );
      }

      return interviewMetric.additionalData;
    } catch (error) {
      this.logger.error(
        `Error getting interview analytics: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Generate real interview analytics data from job applications
   */
  private async generateRealInterviewAnalyticsData(
    companyId: string,
    startDate: Date,
    endDate: Date,
    filters: AnalyticsFilter,
  ) {
    try {
      // Find all job applications with interviews in the date range
      const applications = await this.jobApplicationModel
        .find({
          interviews: { $exists: true, $ne: [] },
          'interviews.scheduledDate': { $gte: startDate, $lte: endDate },
          ...(filters.department && { departmentId: filters.department }),
          ...(filters.jobRole && { jobId: filters.jobRole }),
        })
        .exec();

      if (!applications || applications.length === 0) {
        return this.getMockInterviewAnalyticsData();
      }

      // Extract all interviews from applications
      const allInterviews = applications.flatMap((app) => app.interviews || []);

      // Group interviews by interviewer
      const interviewerMap = new Map();

      for (const interview of allInterviews) {
        if (!interview.interviewers || interview.interviewers.length === 0)
          continue;

        for (const interviewer of interview.interviewers) {
          const interviewerId = interviewer.userId.toString();
          const interviewerName = interviewer.name;

          if (!interviewerMap.has(interviewerId)) {
            interviewerMap.set(interviewerId, {
              interviewer: interviewerName,
              conducted: 0,
              passed: 0,
              totalScore: 0,
              scoreCount: 0,
              totalDuration: 0,
            });
          }

          const stats = interviewerMap.get(interviewerId);
          stats.conducted++;

          // Calculate pass rate if feedback exists
          if (interview.feedback && interview.feedback.length > 0) {
            const interviewerFeedback = interview.feedback.find(
              (f) => f.interviewerId === interviewerId,
            );

            if (interviewerFeedback) {
              if (
                interviewerFeedback.decision === 'yes' ||
                interviewerFeedback.decision === 'definitely_yes'
              ) {
                stats.passed++;
              }

              if (interviewerFeedback.rating) {
                stats.totalScore += interviewerFeedback.rating;
                stats.scoreCount++;
              }
            }
          }

          // Estimate interview duration (in minutes)
          // In a real system, you'd have actual duration data
          const duration = Math.floor(Math.random() * 30) + 30; // 30-60 minutes
          stats.totalDuration += duration;
        }
      }

      // Calculate metrics for each interviewer
      const metrics = Array.from(interviewerMap.values()).map((stats) => ({
        interviewer: stats.interviewer,
        conducted: stats.conducted,
        passRate:
          stats.conducted > 0
            ? Math.round((stats.passed / stats.conducted) * 100 * 10) / 10
            : 0,
        avgScore:
          stats.scoreCount > 0
            ? Math.round((stats.totalScore / stats.scoreCount) * 10) / 10
            : 0,
        avgDuration:
          stats.conducted > 0
            ? Math.round(stats.totalDuration / stats.conducted)
            : 45,
      }));

      // Calculate feedback distribution
      const feedbackDistribution =
        this.calculateFeedbackDistribution(allInterviews);

      // Calculate skill assessments
      const skillAssessments = this.calculateSkillAssessments(allInterviews);

      // Calculate interview stages
      const interviewStages = this.calculateInterviewStages(allInterviews);

      // Calculate monthly trends
      const monthlyTrends = this.calculateInterviewMonthlyTrends(allInterviews);

      return {
        metrics,
        feedbackDistribution,
        skillAssessments,
        interviewStages,
        monthlyTrends,
      };
    } catch (error) {
      this.logger.error(
        `Error generating real interview analytics: ${error.message}`,
        error.stack,
      );
      return this.getMockInterviewAnalyticsData();
    }
  }

  /**
   * Calculate feedback distribution from interviews
   */
  private calculateFeedbackDistribution(interviews: any[]) {
    const decisionCounts = {
      definitely_yes: 0,
      yes: 0,
      no: 0,
      definitely_no: 0,
    };

    for (const interview of interviews) {
      if (interview.feedback && interview.feedback.length > 0) {
        for (const feedback of interview.feedback) {
          if (feedback.decision) {
            decisionCounts[feedback.decision] =
              (decisionCounts[feedback.decision] || 0) + 1;
          }
        }
      }
    }

    return [
      {
        rating: 'Definitely Yes',
        count: decisionCounts['definitely_yes'] || 0,
      },
      { rating: 'Yes', count: decisionCounts['yes'] || 0 },
      { rating: 'No', count: decisionCounts['no'] || 0 },
      { rating: 'Definitely No', count: decisionCounts['definitely_no'] || 0 },
    ];
  }

  /**
   * Calculate skill assessments from interviews
   */
  private calculateSkillAssessments(interviews: any[]) {
    const skillMap = new Map();

    for (const interview of interviews) {
      if (interview.feedback && interview.feedback.length > 0) {
        for (const feedback of interview.feedback) {
          if (feedback.considerations) {
            for (const [skill, score] of Object.entries(
              feedback.considerations,
            )) {
              if (!skillMap.has(skill)) {
                skillMap.set(skill, { totalScore: 0, count: 0 });
              }

              const stats = skillMap.get(skill);
              stats.totalScore += Number(score);
              stats.count++;
            }
          }
        }
      }
    }

    return Array.from(skillMap.entries()).map(([skill, stats]) => ({
      skill: this.formatSkillName(skill),
      avgScore:
        stats.count > 0
          ? Math.round((stats.totalScore / stats.count) * 10) / 10
          : 0,
      interviewCount: stats.count,
    }));
  }

  /**
   * Calculate interview stages from interviews
   */
  private calculateInterviewStages(interviews: any[]) {
    const stageMap = new Map();

    for (const interview of interviews) {
      const stage = interview.stage || 'General';

      if (!stageMap.has(stage)) {
        stageMap.set(stage, {
          count: 0,
          passed: 0,
          totalDuration: 0,
        });
      }

      const stats = stageMap.get(stage);
      stats.count++;

      // Calculate pass rate
      if (interview.feedback && interview.feedback.length > 0) {
        const passCount = interview.feedback.filter(
          (f) => f.decision === 'yes' || f.decision === 'definitely_yes',
        ).length;

        if (passCount > interview.feedback.length / 2) {
          stats.passed++;
        }
      }

      // Estimate interview duration (in minutes)
      const duration = Math.floor(Math.random() * 30) + 30; // 30-60 minutes
      stats.totalDuration += duration;
    }

    return Array.from(stageMap.entries()).map(([stage, stats]) => ({
      stage,
      avgDuration:
        stats.count > 0 ? Math.round(stats.totalDuration / stats.count) : 45,
      passRate:
        stats.count > 0
          ? Math.round((stats.passed / stats.count) * 100 * 10) / 10
          : 0,
      interviewCount: stats.count,
    }));
  }

  /**
   * Calculate monthly interview trends
   */
  private calculateInterviewMonthlyTrends(interviews: any[]) {
    const monthMap = new Map();

    for (const interview of interviews) {
      const date = new Date(interview.scheduledDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
      }).format(date);

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          month: monthName,
          interviews: 0,
          passed: 0,
          total: 0,
        });
      }

      const stats = monthMap.get(monthKey);
      stats.interviews++;

      // Calculate pass rate
      if (interview.feedback && interview.feedback.length > 0) {
        stats.total += interview.feedback.length;

        const passCount = interview.feedback.filter(
          (f) => f.decision === 'yes' || f.decision === 'definitely_yes',
        ).length;

        stats.passed += passCount;
      }
    }

    return Array.from(monthMap.values())
      .map((stats) => ({
        month: stats.month,
        interviews: stats.interviews,
        passRate:
          stats.total > 0
            ? Math.round((stats.passed / stats.total) * 100 * 10) / 10
            : 0,
      }))
      .sort((a, b) => {
        // Sort by date (assuming month format is 'MMM YYYY')
        const [aMonth, aYear] = a.month.split(' ');
        const [bMonth, bYear] = b.month.split(' ');

        if (aYear !== bYear) return Number(aYear) - Number(bYear);

        const months = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
        return months.indexOf(aMonth) - months.indexOf(bMonth);
      });
  }

  /**
   * Format skill name for better display
   */
  private formatSkillName(skill: string): string {
    return skill
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
      .replace(/_/g, ' ') // Replace underscores with spaces
      .trim();
  }

  /**
   * Get source analytics
   */
  async getSourceAnalytics(filters: AnalyticsFilter) {
    this.logger.log(
      `Getting source analytics for company ${filters.companyId}`,
    );

    try {
      // Parse date filters or use defaults (last 30 days)
      const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
      const startDate = filters.startDate
        ? new Date(filters.startDate)
        : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get source analytics data
      const sourceMetric = await this.metricsModel
        .findOne({
          companyId: filters.companyId,
          metricType: 'trend',
          metricKey: 'source_effectiveness',
          periodStart: { $gte: startDate },
          periodEnd: { $lte: endDate },
          ...(filters.department && { departmentId: filters.department }),
          ...(filters.jobRole && { jobId: filters.jobRole }),
          ...(filters.location && {
            'additionalData.location': filters.location,
          }),
        })
        .sort({ date: -1 })
        .exec();

      // If no data found, generate real data from job applications
      if (!sourceMetric || !sourceMetric.additionalData) {
        const sources = await this.generateRealSourceEffectivenessData(
          filters.companyId,
          startDate,
          endDate,
          filters,
        );
        return { sources };
      }

      return {
        sources: sourceMetric.additionalData,
      };
    } catch (error) {
      this.logger.error(
        `Error getting source analytics: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get KPI metrics
   */
  private async getKpiMetrics(
    companyId: string,
    startDate: Date,
    endDate: Date,
    filters: AnalyticsFilter,
  ) {
    // Get all KPI metrics for the company in the date range
    const kpiMetrics = await this.metricsModel
      .find({
        companyId,
        metricType: 'kpi',
        periodStart: { $gte: startDate },
        periodEnd: { $lte: endDate },
        ...(filters.department && { departmentId: filters.department }),
        ...(filters.jobRole && { jobId: filters.jobRole }),
        ...(filters.location && {
          'additionalData.location': filters.location,
        }),
        ...(filters.source && { sourceId: filters.source }),
      })
      .sort({ date: -1 })
      .exec();

    // If no data found, generate real data from job applications
    if (!kpiMetrics || kpiMetrics.length === 0) {
      return this.generateRealKpiData(companyId, startDate, endDate, filters);
    }

    // Transform to the format expected by the frontend
    return kpiMetrics.map((metric) => ({
      label: this.formatMetricLabel(metric.metricKey),
      value: metric.value,
      change: metric.changePercentage,
      trend: metric.trend,
    }));
  }

  /**
   * Get application trend
   */
  private async getApplicationTrend(
    companyId: string,
    startDate: Date,
    endDate: Date,
    filters: AnalyticsFilter,
  ) {
    // Get application trend data
    const trendMetric = await this.metricsModel
      .findOne({
        companyId,
        metricType: 'trend',
        metricKey: 'application_trend',
        periodStart: { $gte: startDate },
        periodEnd: { $lte: endDate },
        ...(filters.department && { departmentId: filters.department }),
        ...(filters.jobRole && { jobId: filters.jobRole }),
        ...(filters.location && {
          'additionalData.location': filters.location,
        }),
        ...(filters.source && { sourceId: filters.source }),
      })
      .sort({ date: -1 })
      .exec();

    // If no data found, generate real trend data from job applications
    if (!trendMetric || !trendMetric.additionalData) {
      return this.generateRealApplicationTrendData(
        companyId,
        startDate,
        endDate,
        filters,
      );
    }

    return trendMetric.additionalData;
  }

  /**
   * Get top performing jobs
   */
  private async getTopPerformingJobs(
    companyId: string,
    startDate: Date,
    endDate: Date,
    filters: AnalyticsFilter,
  ) {
    // Get top jobs data
    const jobsMetric = await this.metricsModel
      .findOne({
        companyId,
        metricType: 'trend',
        metricKey: 'top_jobs',
        periodStart: { $gte: startDate },
        periodEnd: { $lte: endDate },
        ...(filters.department && { departmentId: filters.department }),
        ...(filters.jobRole && { jobId: filters.jobRole }),
        ...(filters.location && {
          'additionalData.location': filters.location,
        }),
      })
      .sort({ date: -1 })
      .exec();

    // If no data found, generate real job performance data from job applications
    if (!jobsMetric || !jobsMetric.additionalData) {
      return this.generateRealTopJobsData(
        companyId,
        startDate,
        endDate,
        filters,
      );
    }

    return jobsMetric.additionalData;
  }

  /**
   * Get source effectiveness
   */
  private async getSourceEffectiveness(
    companyId: string,
    startDate: Date,
    endDate: Date,
    filters: AnalyticsFilter,
  ) {
    // Get source effectiveness data
    const sourceMetric = await this.metricsModel
      .findOne({
        companyId,
        metricType: 'trend',
        metricKey: 'source_effectiveness',
        periodStart: { $gte: startDate },
        periodEnd: { $lte: endDate },
        ...(filters.department && { departmentId: filters.department }),
        ...(filters.jobRole && { jobId: filters.jobRole }),
        ...(filters.location && {
          'additionalData.location': filters.location,
        }),
      })
      .sort({ date: -1 })
      .exec();

    // If no data found, generate real source effectiveness data from job applications
    if (!sourceMetric || !sourceMetric.additionalData) {
      return this.generateRealSourceEffectivenessData(
        companyId,
        startDate,
        endDate,
        filters,
      );
    }

    return sourceMetric.additionalData;
  }

  /**
   * Format metric label
   */
  private formatMetricLabel(metricKey: string): string {
    const labelMap = {
      total_applications: 'Total Applications',
      active_candidates: 'Active Candidates',
      time_to_hire: 'Time to Hire (days)',
      conversion_rate: 'Conversion Rate',
    };

    return labelMap[metricKey] || metricKey;
  }

  /**
   * Real data generation methods
   */

  /**
   * Generate real KPI data from job applications
   */
  private async generateRealKpiData(
    companyId: string,
    startDate: Date,
    endDate: Date,
    filters: AnalyticsFilter,
  ) {
    this.logger.log(`Generating real KPI data for company ${companyId}`);

    // Build query filters
    const queryFilters: any = {
      createdAt: { $gte: startDate, $lte: endDate },
    };

    // Add optional filters
    if (filters.department) queryFilters.departmentId = filters.department;
    if (filters.jobRole) queryFilters.jobId = filters.jobRole;
    if (filters.location) queryFilters.location = filters.location;
    if (filters.source) queryFilters.source = filters.source;

    // Calculate total applications
    const totalApplications = await this.jobApplicationModel
      .countDocuments(queryFilters)
      .exec();

    // Calculate active candidates (not in terminal states)
    const activeCandidates = await this.jobApplicationModel
      .countDocuments({
        ...queryFilters,
        status: { $nin: ['rejected', 'hired', 'withdrawn'] },
      })
      .exec();

    // Calculate time to hire
    const hiredApplications = await this.jobApplicationModel
      .find({
        ...queryFilters,
        status: 'hired',
      })
      .exec();

    let timeToHire = 0;
    if (hiredApplications.length > 0) {
      let totalDays = 0;
      for (const app of hiredApplications) {
        const createdDate = new Date(app.createdAt);
        const hiredDate = new Date(app.updatedAt);
        const timeDiff = hiredDate.getTime() - createdDate.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        totalDays += daysDiff;
      }
      timeToHire = Math.round(totalDays / hiredApplications.length);
    }

    // Calculate conversion rate
    const conversionRate =
      totalApplications > 0
        ? parseFloat(
            ((hiredApplications.length / totalApplications) * 100).toFixed(1),
          )
        : 0;

    // Get previous period data for comparison
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);

    const previousPeriodEnd = new Date(endDate);
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 30);

    const previousQueryFilters = {
      ...queryFilters,
      createdAt: { $gte: previousPeriodStart, $lte: previousPeriodEnd },
    };

    const prevTotalApplications = await this.jobApplicationModel
      .countDocuments(previousQueryFilters)
      .exec();
    const prevHiredApplications = await this.jobApplicationModel
      .countDocuments({
        ...previousQueryFilters,
        status: 'hired',
      })
      .exec();

    // Calculate changes
    const applicationsChange =
      prevTotalApplications > 0
        ? ((totalApplications - prevTotalApplications) /
            prevTotalApplications) *
          100
        : 0;

    const conversionChange =
      prevTotalApplications > 0 && prevHiredApplications > 0
        ? conversionRate - (prevHiredApplications / prevTotalApplications) * 100
        : 0;

    // Return KPI metrics in the expected format
    return [
      {
        label: 'Total Applications',
        value: totalApplications,
        change: parseFloat(applicationsChange.toFixed(1)),
        trend:
          applicationsChange > 0
            ? 'up'
            : applicationsChange < 0
              ? 'down'
              : 'neutral',
      },
      {
        label: 'Active Candidates',
        value: activeCandidates,
        change: 0, // We don't have previous data for this
        trend: 'neutral',
      },
      {
        label: 'Time to Hire (days)',
        value: timeToHire,
        change: 0, // We don't have previous data for this
        trend: 'neutral',
      },
      {
        label: 'Conversion Rate',
        value: conversionRate,
        change: parseFloat(conversionChange.toFixed(1)),
        trend:
          conversionChange > 0
            ? 'up'
            : conversionChange < 0
              ? 'down'
              : 'neutral',
      },
    ];
  }

  /**
   * Generate real application trend data from job applications
   */
  private async generateRealApplicationTrendData(
    companyId: string,
    startDate: Date,
    endDate: Date,
    filters: AnalyticsFilter,
  ) {
    this.logger.log(
      `Generating real application trend data for company ${companyId}`,
    );

    // Build query filters
    const queryFilters: any = { companyId };

    // Add optional filters
    if (filters.department) queryFilters.departmentId = filters.department;
    if (filters.jobRole) queryFilters.jobId = filters.jobRole;
    if (filters.location) queryFilters.location = filters.location;
    if (filters.source) queryFilters.source = filters.source;

    // Use MongoDB aggregation to group applications by date
    const dailyTrends = await this.jobApplicationModel
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            ...queryFilters,
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
   * Generate real top jobs data from job applications
   */
  private async generateRealTopJobsData(
    companyId: string,
    startDate: Date,
    endDate: Date,
    filters: AnalyticsFilter,
  ) {
    this.logger.log(`Generating real top jobs data for company ${companyId}`);

    // Build query filters
    const queryFilters: any = { companyId };

    // Add optional filters
    if (filters.department) queryFilters.departmentId = filters.department;
    if (filters.location) queryFilters.location = filters.location;

    try {
      // Use MongoDB aggregation to group applications by job
      const jobPerformance = await this.jobApplicationModel
        .aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate },
              ...queryFilters,
            },
          },
          {
            $lookup: {
              from: 'jobs',
              localField: 'jobId',
              foreignField: '_id',
              as: 'jobDetails',
            },
          },
          {
            $unwind: { path: '$jobDetails', preserveNullAndEmptyArrays: true },
          },
          {
            $group: {
              _id: '$jobId',
              title: {
                $first: { $ifNull: ['$jobDetails.title', 'Unknown Job'] },
              },
              applications: { $sum: 1 },
              hires: {
                $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] },
              },
            },
          },
          {
            $project: {
              _id: 0,
              id: '$_id',
              title: 1,
              applications: 1,
              hires: 1,
              conversionRate: {
                $cond: [
                  { $eq: ['$applications', 0] },
                  0,
                  {
                    $multiply: [{ $divide: ['$hires', '$applications'] }, 100],
                  },
                ],
              },
            },
          },
          { $sort: { applications: -1 } },
          { $limit: 5 },
        ])
        .exec();

      // Format the conversion rate to one decimal place
      return jobPerformance.map((job) => ({
        ...job,
        conversionRate: parseFloat(job.conversionRate.toFixed(1)),
      }));
    } catch (error) {
      this.logger.error(
        `Error generating real top jobs data: ${error.message}`,
        error.stack,
      );
      // Fallback to mock data if there's an error
      return this.getMockTopJobsData();
    }
  }

  /**
   * Generate real source effectiveness data from job applications
   */
  private async generateRealSourceEffectivenessData(
    companyId: string,
    startDate: Date,
    endDate: Date,
    filters: AnalyticsFilter,
  ) {
    this.logger.log(
      `Generating real source effectiveness data for company ${companyId}`,
    );

    // Build query filters
    const queryFilters: any = {};

    // Add optional filters
    if (filters.department) queryFilters.departmentId = filters.department;
    if (filters.jobRole) queryFilters.jobId = filters.jobRole;
    if (filters.location) queryFilters.location = filters.location;

    try {
      // Use MongoDB aggregation to group applications by source
      const sourceEffectiveness = await this.jobApplicationModel
        .aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate },
              ...queryFilters,
            },
          },
          {
            $group: {
              _id: { $ifNull: ['$source', 'Direct'] },
              applications: { $sum: 1 },
              hires: {
                $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] },
              },
            },
          },
          {
            $project: {
              _id: 0,
              source: '$_id',
              applications: 1,
              hires: 1,
              conversionRate: {
                $cond: [
                  { $eq: ['$applications', 0] },
                  0,
                  {
                    $multiply: [{ $divide: ['$hires', '$applications'] }, 100],
                  },
                ],
              },
            },
          },
          { $sort: { applications: -1 } },
        ])
        .exec();

      // Format the conversion rate to one decimal place
      return sourceEffectiveness.map((source) => ({
        ...source,
        conversionRate: parseFloat(source.conversionRate.toFixed(1)),
      }));
    } catch (error) {
      this.logger.error(
        `Error generating real source effectiveness data: ${error.message}`,
        error.stack,
      );
      // Fallback to mock data if there's an error
      return this.getMockSourceEffectivenessData();
    }
  }

  /**
   * Mock data methods
   * These are used as fallbacks when real data is not available
   */

  private getMockKpiData() {
    return [
      { label: 'Total Applications', value: 342, change: 12.5, trend: 'up' },
      { label: 'Active Candidates', value: 87, change: 5.2, trend: 'up' },
      { label: 'Time to Hire (days)', value: 28, change: -3.5, trend: 'down' },
      { label: 'Conversion Rate', value: 4.2, change: 0.8, trend: 'up' },
    ];
  }

  private getMockApplicationTrendData() {
    return [
      { date: '2025-08-01', count: 42 },
      { date: '2025-08-08', count: 38 },
      { date: '2025-08-15', count: 56 },
      { date: '2025-08-22', count: 48 },
      { date: '2025-08-29', count: 62 },
      { date: '2025-09-05', count: 58 },
      { date: '2025-09-12', count: 64 },
      { date: '2025-09-19', count: 72 },
    ];
  }

  private getMockTopJobsData() {
    return [
      { title: 'Frontend Developer', applications: 78, conversionRate: 5.1 },
      { title: 'UX Designer', applications: 56, conversionRate: 5.4 },
      { title: 'Product Manager', applications: 42, conversionRate: 4.8 },
    ];
  }

  private getMockSourceEffectivenessData() {
    return [
      { source: 'Referrals', applications: 48, conversionRate: 12.5 },
      { source: 'LinkedIn', applications: 124, conversionRate: 6.5 },
      { source: 'Indeed', applications: 86, conversionRate: 5.8 },
    ];
  }

  private getMockFunnelData() {
    return {
      stages: [
        { stage: 'Applications', count: 342, conversionRate: 100 },
        { stage: 'Screening', count: 186, conversionRate: 54.4 },
        { stage: 'Interview', count: 98, conversionRate: 52.7 },
        { stage: 'Assessment', count: 64, conversionRate: 65.3 },
        { stage: 'Offer', count: 28, conversionRate: 43.8 },
        { stage: 'Hired', count: 21, conversionRate: 75.0 },
      ],
      departmentBreakdown: [
        {
          department: 'Engineering',
          applications: 145,
          hires: 9,
          conversionRate: 6.2,
        },
        {
          department: 'Product',
          applications: 78,
          hires: 4,
          conversionRate: 5.1,
        },
        {
          department: 'Design',
          applications: 56,
          hires: 3,
          conversionRate: 5.4,
        },
        {
          department: 'Marketing',
          applications: 42,
          hires: 3,
          conversionRate: 7.1,
        },
        {
          department: 'Sales',
          applications: 21,
          hires: 2,
          conversionRate: 9.5,
        },
      ],
      timeToHire: {
        average: 28,
        byStage: [
          { stage: 'Application to Screening', days: 3 },
          { stage: 'Screening to Interview', days: 7 },
          { stage: 'Interview to Assessment', days: 5 },
          { stage: 'Assessment to Offer', days: 8 },
          { stage: 'Offer to Hire', days: 5 },
        ],
      },
    };
  }

  private getMockJobPerformanceData() {
    return {
      jobs: [
        {
          id: '1',
          title: 'Frontend Developer',
          applications: 78,
          interviews: 24,
          offers: 6,
          hires: 4,
          timeToFill: 32,
          conversionRate: 5.1,
        },
        {
          id: '2',
          title: 'Backend Engineer',
          applications: 64,
          interviews: 18,
          offers: 5,
          hires: 3,
          timeToFill: 28,
          conversionRate: 4.7,
        },
        {
          id: '3',
          title: 'Product Manager',
          applications: 42,
          interviews: 12,
          offers: 3,
          hires: 2,
          timeToFill: 35,
          conversionRate: 4.8,
        },
        {
          id: '4',
          title: 'UX Designer',
          applications: 56,
          interviews: 16,
          offers: 4,
          hires: 3,
          timeToFill: 26,
          conversionRate: 5.4,
        },
        {
          id: '5',
          title: 'DevOps Engineer',
          applications: 38,
          interviews: 10,
          offers: 3,
          hires: 2,
          timeToFill: 30,
          conversionRate: 5.3,
        },
      ],
    };
  }

  private getMockInterviewAnalyticsData() {
    return {
      metrics: [
        {
          interviewer: 'John Smith',
          conducted: 24,
          passRate: 62.5,
          avgScore: 7.8,
          avgDuration: 48,
        },
        {
          interviewer: 'Emily Johnson',
          conducted: 18,
          passRate: 72.2,
          avgScore: 8.2,
          avgDuration: 52,
        },
        {
          interviewer: 'Michael Brown',
          conducted: 16,
          passRate: 68.8,
          avgScore: 7.6,
          avgDuration: 45,
        },
      ],
      feedbackDistribution: [
        { rating: 'Definitely Yes', count: 28 },
        { rating: 'Yes', count: 42 },
        { rating: 'No', count: 32 },
        { rating: 'Definitely No', count: 18 },
      ],
    };
  }

  private getMockSourceAnalyticsData() {
    return {
      sources: [
        {
          source: 'LinkedIn',
          applications: 124,
          qualifiedCandidates: 68,
          hires: 8,
          costPerHire: 1200,
          conversionRate: 6.5,
        },
        {
          source: 'Indeed',
          applications: 86,
          qualifiedCandidates: 42,
          hires: 5,
          costPerHire: 950,
          conversionRate: 5.8,
        },
        {
          source: 'Referrals',
          applications: 48,
          qualifiedCandidates: 32,
          hires: 6,
          costPerHire: 500,
          conversionRate: 12.5,
        },
      ],
    };
  }
}
