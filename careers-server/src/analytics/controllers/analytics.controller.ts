import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';
import { AnalyticsService } from '../services/analytics.service';
import { CompanyId } from '../../company/decorators/company-id.decorator';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.RECRUITER)
  @UseInterceptors(CacheInterceptor)
  async getDashboardMetrics(
    @CompanyId() companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('department') department?: string,
    @Query('jobRole') jobRole?: string,
    @Query('location') location?: string,
    @Query('source') source?: string,
    @Query('comparisonPeriod') comparisonPeriod?: string,
  ) {
    return this.analyticsService.getDashboardMetrics({
      companyId,
      startDate,
      endDate,
      department,
      jobRole,
      location,
      source,
      comparisonPeriod,
    });
  }

  @Get('funnel')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.RECRUITER)
  @UseInterceptors(CacheInterceptor)
  async getFunnelData(
    @CompanyId() companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('department') department?: string,
    @Query('jobRole') jobRole?: string,
    @Query('location') location?: string,
    @Query('source') source?: string,
  ) {
    return this.analyticsService.getFunnelData({
      companyId,
      startDate,
      endDate,
      department,
      jobRole,
      location,
      source,
    });
  }

  @Get('jobs')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.RECRUITER)
  @UseInterceptors(CacheInterceptor)
  async getJobPerformance(
    @CompanyId() companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('department') department?: string,
    @Query('jobRole') jobRole?: string,
    @Query('location') location?: string,
  ) {
    return this.analyticsService.getJobPerformance({
      companyId,
      startDate,
      endDate,
      department,
      jobRole,
      location,
    });
  }

  @Get('interviews')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.RECRUITER)
  @UseInterceptors(CacheInterceptor)
  async getInterviewAnalytics(
    @CompanyId() companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('department') department?: string,
    @Query('jobRole') jobRole?: string,
  ) {
    return this.analyticsService.getInterviewAnalytics({
      companyId,
      startDate,
      endDate,
      department,
      jobRole,
    });
  }

  @Get('sources')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.RECRUITER)
  @UseInterceptors(CacheInterceptor)
  async getSourceAnalytics(
    @CompanyId() companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('department') department?: string,
    @Query('jobRole') jobRole?: string,
    @Query('location') location?: string,
  ) {
    return this.analyticsService.getSourceAnalytics({
      companyId,
      startDate,
      endDate,
      department,
      jobRole,
      location,
    });
  }
}
