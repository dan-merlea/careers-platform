import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobApplication } from '../job-applications/schemas/job-application.schema';
import { Job } from '../job/job.entity';
import { HeadcountRequest } from '../headcount/headcount-request.model';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/schemas/user.schema';
import { Company } from '../company/company.schema';
import { JobRole } from '../company/schemas/job-role.schema';
import { InterviewProcess } from '../interviews/interview-process.entity';
import { Department } from '../company/schemas/department.schema';
import { CalendarCredentials } from '../calendar/schemas/calendar-credentials.schema';

export interface DashboardStats {
  interviews: {
    total: number;
    change: number;
    changeType: 'increase' | 'decrease';
  };
  jobs: {
    active: number;
    change: number;
    changeType: 'increase' | 'decrease';
  };
  applications: {
    total: number;
    change: number;
    changeType: 'increase' | 'decrease';
  };
  referrals: {
    total: number;
    change: number;
    changeType: 'increase' | 'decrease';
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    date: string;
  }>;
  userReferrals: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    jobId: string;
    jobTitle: string;
    status: string;
    progress: number;
    createdAt: string;
    stages: Array<{
      id: string;
      title: string;
      order: number;
      color: string;
    }>;
  }>;
  userInterviews: Array<{
    id: string;
    scheduledDate: string;
    title: string;
    description?: string;
    interviewers: Array<{
      userId: string;
      name: string;
    }>;
    stage: string;
    status: string;
    applicantId: string;
    applicantName: string;
    jobTitle: string;
    createdAt: string;
  }>;
  headcountRequests: Array<{
    id: string;
    title: string;
    department: string;
    requestedBy: string;
    status: string;
    createdAt: string;
  }>;
  newCandidates: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    jobId: string;
    jobTitle: string;
    createdAt: string;
  }>;
  pendingJobApprovals: Array<{
    id: string;
    title: string;
    department: string;
    requestedBy: string;
    requestedByName: string;
    status: string;
    createdAt: string;
  }>;
  suggestions: Array<{
    id: string;
    type: 'interview_process' | 'company_details' | 'department_assignment' | 'calendar_integration';
    title: string;
    description: string;
    actionText: string;
    actionLink: string;
  }>;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(JobApplication.name)
    private jobApplicationModel: Model<JobApplication>,
    @InjectModel(Job.name)
    private jobModel: Model<Job>,
    @InjectModel(HeadcountRequest.name)
    private headcountRequestModel: Model<HeadcountRequest>,
    @InjectModel(Company.name)
    private companyModel: Model<Company>,
    @InjectModel(JobRole.name)
    private jobRoleModel: Model<JobRole>,
    @InjectModel(InterviewProcess.name)
    private interviewProcessModel: Model<InterviewProcess>,
    @InjectModel(Department.name)
    private departmentModel: Model<Department>,
    @InjectModel(CalendarCredentials.name)
    private calendarCredentialsModel: Model<CalendarCredentials>,
    private usersService: UsersService,
  ) {}

  async getStats(companyId: string, userId: string): Promise<DashboardStats> {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBeforeYesterday = new Date(now);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

    // Get interviews stats (count interviews from all job applications)
    const applicationsWithInterviews = await this.jobApplicationModel.find({
      companyId,
      'interviews.0': { $exists: true },
    });
    const totalInterviews = applicationsWithInterviews.reduce(
      (sum, app) => sum + (app.interviews?.length || 0),
      0,
    );

    const applicationsWithInterviewsYesterday =
      await this.jobApplicationModel.find({
        companyId,
        'interviews.createdAt': { $gte: dayBeforeYesterday, $lt: yesterday },
      });
    const interviewsYesterday = applicationsWithInterviewsYesterday.reduce(
      (sum, app) =>
        sum +
        (app.interviews?.filter(
          (i) => i.createdAt >= dayBeforeYesterday && i.createdAt < yesterday,
        ).length || 0),
      0,
    );

    const applicationsWithInterviewsToday = await this.jobApplicationModel.find(
      {
        companyId,
        'interviews.createdAt': { $gte: yesterday },
      },
    );
    const interviewsToday = applicationsWithInterviewsToday.reduce(
      (sum, app) =>
        sum +
        (app.interviews?.filter((i) => i.createdAt >= yesterday).length || 0),
      0,
    );
    const interviewsChange = interviewsToday - interviewsYesterday;

    // Get jobs stats
    const activeJobs = await this.jobModel.countDocuments({
      companyId,
      status: 'open',
    });
    const activeJobsYesterday = await this.jobModel.countDocuments({
      companyId,
      status: 'open',
      createdAt: { $lt: yesterday },
    });
    const jobsChange = activeJobs - activeJobsYesterday;

    // Get applications stats
    const totalApplications = await this.jobApplicationModel.countDocuments({
      companyId,
    });
    const applicationsYesterday = await this.jobApplicationModel.countDocuments(
      {
        companyId,
        createdAt: { $gte: dayBeforeYesterday, $lt: yesterday },
      },
    );
    const applicationsToday = await this.jobApplicationModel.countDocuments({
      companyId,
      createdAt: { $gte: yesterday },
    });
    const applicationsChange = applicationsToday - applicationsYesterday;

    // Get referrals stats
    const totalReferrals = await this.jobApplicationModel.countDocuments({
      companyId,
      isReferral: true,
    });
    const referralsYesterday = await this.jobApplicationModel.countDocuments({
      companyId,
      isReferral: true,
      createdAt: { $gte: dayBeforeYesterday, $lt: yesterday },
    });
    const referralsToday = await this.jobApplicationModel.countDocuments({
      companyId,
      isReferral: true,
      createdAt: { $gte: yesterday },
    });
    const referralsChange = referralsToday - referralsYesterday;

    // Get recent activity (last 10 items)
    const recentApplications = await this.jobApplicationModel
      .find({ companyId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('jobId', 'title')
      .exec();

    const recentJobs = await this.jobModel
      .find({ companyId })
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();

    // Combine and sort all activities
    const activities = [
      ...recentApplications.map((app) => ({
        id: app._id.toString(),
        type: 'application',
        description: `New application for ${(app.jobId as any)?.title || 'position'}`,
        date: app.createdAt.toISOString(),
        timestamp: app.createdAt.getTime(),
      })),
      ...recentJobs.map((job) => ({
        id: job._id.toString(),
        type: 'job',
        description: `New job posted: ${job.title}`,
        date: job.createdAt.toISOString(),
        timestamp: job.createdAt.getTime(),
      })),
    ];

    // Sort by timestamp and take top 10
    const recentActivity = activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)
      .map(({ timestamp, ...rest }) => rest);

    // Get user-specific referrals (limit to 3)
    const userReferralsData = await this.jobApplicationModel
      .find({
        companyId,
        refereeId: userId,
        isReferral: true,
      })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('jobId', 'title')
      .exec();

    const userReferrals = userReferralsData.map((app: any) => {
      const appData = app.toObject ? app.toObject() : app;
      return {
        id: app._id.toString(),
        firstName: app.firstName,
        lastName: app.lastName,
        email: app.email,
        jobId: typeof app.jobId === 'string' ? app.jobId : app.jobId._id.toString(),
        jobTitle: app.jobId?.title || 'Unknown Position',
        status: app.status,
        progress: app.progress || 0,
        createdAt: app.createdAt.toISOString(),
        stages: Array.isArray(appData.stages)
          ? appData.stages.map((stage: any) => ({
              id: stage.id,
              title: stage.title,
              order: stage.order,
              color: stage.color,
            }))
          : [],
      };
    });

    // Get user-specific interviews (limit to 3)
    const userInterviewsData = await this.jobApplicationModel
      .find({
        companyId,
        'interviews.interviewers.userId': userId,
      })
      .sort({ 'interviews.scheduledDate': -1 })
      .limit(3)
      .populate('jobId', 'title')
      .exec();

    // Extract interviews from applications and flatten
    const allUserInterviews = userInterviewsData.flatMap((app) =>
      (app.interviews || []).map((interview) => ({
        id: interview._id?.toString() || '',
        scheduledDate: interview.scheduledDate.toISOString(),
        title: interview.title,
        description: interview.description,
        interviewers: interview.interviewers.map((i) => ({
          userId: i.userId.toString(),
          name: i.name,
        })),
        stage: interview.stage,
        status: interview.status,
        applicantId: app._id.toString(),
        applicantName: `${app.firstName} ${app.lastName}`,
        jobTitle: (app.jobId as any)?.title || 'Unknown Position',
        createdAt:
          interview.createdAt?.toISOString() || new Date().toISOString(),
      })),
    );

    // Get user info to check role
    const user = await this.usersService.findById(userId);
    const userRole = user?.role;

    // Get headcount requests (only for approvers: ADMIN, DIRECTOR)
    const headcountRequests: Array<{
      id: string;
      title: string;
      department: string;
      requestedBy: string;
      status: string;
      createdAt: string;
    }> = [];
    if (userRole === UserRole.ADMIN || userRole === UserRole.DIRECTOR) {
      const requests = await this.headcountRequestModel
        .find({
          companyId,
          status: 'pending',
        })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('requestedBy', 'name')
        .exec();

      requests.forEach((req: any) => {
        headcountRequests.push({
          id: req._id.toString(),
          title: req.role,
          department: req.department,
          requestedBy: req.requestedBy?.name || 'Unknown',
          status: req.status,
          createdAt: req.createdAt.toISOString(),
        });
      });
    }

    // Get new candidates (only for recruiters: ADMIN, DIRECTOR, RECRUITER)
    const newCandidates: Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      jobId: string;
      jobTitle: string;
      createdAt: string;
    }> = [];
    if (
      userRole === UserRole.ADMIN ||
      userRole === UserRole.DIRECTOR ||
      userRole === UserRole.RECRUITER
    ) {
      const candidates = await this.jobApplicationModel
        .find({
          companyId,
          status: { $in: ['applied', 'new', 'pending'] },
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('jobId', 'title')
        .exec();

      candidates.forEach((candidate: any) => {
        newCandidates.push({
          id: candidate._id.toString(),
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          jobId:
            typeof candidate.jobId === 'string'
              ? candidate.jobId
              : candidate.jobId.toString(),
          jobTitle: candidate.jobId?.title || 'Unknown Position',
          createdAt: candidate.createdAt.toISOString(),
        });
      });
    }

    // Get pending job approvals (only for approvers: ADMIN, DIRECTOR)
    const pendingJobApprovals: Array<{
      id: string;
      title: string;
      department: string;
      requestedBy: string;
      requestedByName: string;
      status: string;
      createdAt: string;
    }> = [];
    if (userRole === UserRole.ADMIN || userRole === UserRole.DIRECTOR) {
      const pendingJobs = await this.jobModel
        .find({
          companyId,
          status: 'pending',
        })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('createdBy', 'name')
        .exec();

      pendingJobs.forEach((job: any) => {
        pendingJobApprovals.push({
          id: job._id.toString(),
          title: job.title,
          department: job.department || 'N/A',
          requestedBy: job.createdBy?._id?.toString() || '',
          requestedByName: job.createdBy?.name || 'Unknown',
          status: job.status,
          createdAt: job.createdAt.toISOString(),
        });
      });
    }

    // Generate suggestions
    const suggestions: Array<{
      id: string;
      type: 'interview_process' | 'company_details' | 'department_assignment' | 'calendar_integration';
      title: string;
      description: string;
      actionText: string;
      actionLink: string;
    }> = [];

    // Check for missing company details
    const company = await this.companyModel.findById(companyId);
    const hasCompanyDetails = company && 
      company.description && 
      company.industry && 
      company.website;
    
    if (!hasCompanyDetails) {
      suggestions.push({
        id: 'company-details',
        type: 'company_details',
        title: 'Complete Company Profile',
        description: 'Add your company description, industry, and website to attract better candidates.',
        actionText: 'Add Company Details',
        actionLink: '/company-details',
      });
    }

    // Check for job roles without interview processes
    const allJobRoles = await this.jobRoleModel.find({ companyId }).exec();
    const jobRoleIds = allJobRoles.map(role => role._id.toString());
    
    const interviewProcesses = await this.interviewProcessModel
      .find({ companyId })
      .exec();
    const processJobRoleIds = interviewProcesses.map(process => 
      process.jobRoleId.toString()
    );
    
    const rolesWithoutProcess = allJobRoles.filter(
      role => !processJobRoleIds.includes(role._id.toString())
    );

    if (rolesWithoutProcess.length > 0) {
      const roleNames = rolesWithoutProcess.slice(0, 3).map(r => r.title).join(', ');
      const moreCount = rolesWithoutProcess.length > 3 ? ` and ${rolesWithoutProcess.length - 3} more` : '';
      
      suggestions.push({
        id: 'interview-process',
        type: 'interview_process',
        title: 'Create Interview Processes',
        description: `${rolesWithoutProcess.length} role${rolesWithoutProcess.length > 1 ? 's' : ''} missing interview process: ${roleNames}${moreCount}.`,
        actionText: 'Create Interview Process',
        actionLink: '/interview-processes/create',
      });
    }

    // Check for managers/directors without department assignments
    const allUsers = await this.usersService.findByCompany(companyId);
    const managersAndDirectors = allUsers.filter(
      u => (u.role === UserRole.MANAGER || u.role === UserRole.DIRECTOR) && !u.departmentId
    );

    if (managersAndDirectors.length > 0) {
      const userNames = managersAndDirectors.slice(0, 3).map(u => u.name).join(', ');
      const moreCount = managersAndDirectors.length > 3 ? ` and ${managersAndDirectors.length - 3} more` : '';
      
      suggestions.push({
        id: 'department-assignment',
        type: 'department_assignment',
        title: 'Assign Department Leaders',
        description: `${managersAndDirectors.length} manager${managersAndDirectors.length > 1 ? 's' : ''}/director${managersAndDirectors.length > 1 ? 's' : ''} without department assignment: ${userNames}${moreCount}. Create departments and assign leaders.`,
        actionText: 'Manage Departments',
        actionLink: '/company-details?tab=departments',
      });
    }

    // Check for calendar integration
    const calendarCredentials = await this.calendarCredentialsModel
      .findOne({ userId })
      .exec();
    
    if (!calendarCredentials) {
      suggestions.push({
        id: 'calendar-integration',
        type: 'calendar_integration',
        title: 'Connect Your Calendar',
        description: 'Integrate Google Calendar or Microsoft Outlook to automatically schedule interviews and sync with your calendar.',
        actionText: 'Setup Calendar Integration',
        actionLink: '/setup',
      });
    }

    return {
      interviews: {
        total: totalInterviews,
        change: Math.abs(interviewsChange),
        changeType: interviewsChange >= 0 ? 'increase' : 'decrease',
      },
      jobs: {
        active: activeJobs,
        change: Math.abs(jobsChange),
        changeType: jobsChange >= 0 ? 'increase' : 'decrease',
      },
      applications: {
        total: totalApplications,
        change: Math.abs(applicationsChange),
        changeType: applicationsChange >= 0 ? 'increase' : 'decrease',
      },
      referrals: {
        total: totalReferrals,
        change: Math.abs(referralsChange),
        changeType: referralsChange >= 0 ? 'increase' : 'decrease',
      },
      recentActivity,
      userReferrals,
      userInterviews: allUserInterviews,
      headcountRequests,
      newCandidates,
      pendingJobApprovals,
      suggestions,
    };
  }
}
