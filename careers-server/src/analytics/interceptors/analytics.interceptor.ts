import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AnalyticsAggregatorService } from '../services/analytics-aggregator.service';

@Injectable()
export class AnalyticsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AnalyticsInterceptor.name);

  constructor(private readonly analyticsAggregatorService: AnalyticsAggregatorService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, path, user, body } = request;
    
    // Process the request through the handler
    return next.handle().pipe(
      tap(async (data) => {
        try {
          // Only process if we have a user and company context
          if (!user || !user.companyId) return;
          
          const companyId = user.companyId;
          
          // Handle application creation
          if (path.includes('/job-applications') && method === 'POST') {
            this.logger.log(`Updating analytics for new application in company ${companyId}`);
            
            const jobId = body.jobId || (data && data.jobId);
            const sourceId = body.sourceId || (data && data.sourceId);
            
            await this.analyticsAggregatorService.incrementApplicationCount(
              companyId,
              jobId,
              sourceId
            );
          }
          
          // Handle candidate status changes
          if (path.includes('/job-applications') && method === 'PATCH' && body.status) {
            this.logger.log(`Updating analytics for candidate status change in company ${companyId}`);
            
            const applicationId = path.split('/').pop();
            const newStatus = body.status;
            const previousStatus = body.previousStatus;
            
            // You would implement this method in the aggregator service
            // await this.analyticsAggregatorService.updateCandidateStatus(
            //   companyId,
            //   applicationId,
            //   newStatus,
            //   previousStatus
            // );
          }
          
          // Handle interview creation
          if (path.includes('/interviews') && method === 'POST') {
            this.logger.log(`Updating analytics for new interview in company ${companyId}`);
            
            const jobId = body.jobId || (data && data.jobId);
            const applicationId = body.applicationId || (data && data.applicationId);
            
            // You would implement this method in the aggregator service
            // await this.analyticsAggregatorService.incrementInterviewCount(
            //   companyId,
            //   jobId,
            //   applicationId
            // );
          }
          
          // Handle interview feedback submission
          if (path.includes('/interviews') && path.includes('/feedback') && method === 'POST') {
            this.logger.log(`Updating analytics for interview feedback in company ${companyId}`);
            
            const interviewId = path.split('/').slice(-2)[0];
            const rating = body.rating || (data && data.rating);
            
            // You would implement this method in the aggregator service
            // await this.analyticsAggregatorService.updateInterviewFeedback(
            //   companyId,
            //   interviewId,
            //   rating
            // );
          }
          
          // Handle job creation
          if (path.includes('/jobs') && method === 'POST' && !path.includes('applications')) {
            this.logger.log(`Updating analytics for new job in company ${companyId}`);
            
            const jobId = data && data._id;
            const departmentId = body.departmentId || (data && data.departmentId);
            
            // You would implement this method in the aggregator service
            // await this.analyticsAggregatorService.addNewJob(
            //   companyId,
            //   jobId,
            //   departmentId
            // );
          }
          
          // Add more conditions for other analytics-affecting actions
          
        } catch (error) {
          this.logger.error(`Error updating analytics: ${error.message}`, error.stack);
          // Don't rethrow the error - we don't want to affect the main request flow
        }
      })
    );
  }
}
