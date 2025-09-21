import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('interviews')
@Controller('interviews')
@UseGuards(JwtAuthGuard)
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get all interviews for active applicants' })
  @ApiResponse({
    status: 200,
    description: 'Returns all interviews for active applicants',
  })
  async getActiveInterviews() {
    return this.interviewsService.getActiveInterviews();
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get all upcoming interviews' })
  @ApiResponse({ status: 200, description: 'Returns all upcoming interviews' })
  async getUpcomingInterviews() {
    return this.interviewsService.getUpcomingInterviews();
  }
  
  @Get('user')
  @ApiOperation({ summary: 'Get interviews for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns interviews where the current user is an interviewer',
  })
  async getUserInterviews(@Request() req: { user: { userId: string } }) {
    const userId = req.user.userId;
    return this.interviewsService.getUserInterviews(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get interview by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the interview with the specified ID',
  })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async getInterviewById(@Param('id') id: string) {
    return this.interviewsService.getInterviewById(id);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel an interview' })
  @ApiResponse({ status: 200, description: 'Interview cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async cancelInterview(
    @Param('id') id: string,
    @Body() cancelData: { reason: string },
  ) {
    return this.interviewsService.cancelInterview(id, cancelData.reason);
  }

  @Put(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule an interview' })
  @ApiResponse({ status: 200, description: 'Interview rescheduled successfully' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async rescheduleInterview(
    @Param('id') id: string,
    @Body() rescheduleData: { scheduledDate: string },
  ) {
    return this.interviewsService.rescheduleInterview(id, new Date(rescheduleData.scheduledDate));
  }

  @Put(':id/interviewers')
  @ApiOperation({ summary: 'Update interviewers for an interview' })
  @ApiResponse({ status: 200, description: 'Interviewers updated successfully' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async updateInterviewers(
    @Param('id') id: string,
    @Body() updateData: { interviewers: { userId: string; name: string }[] },
  ) {
    return this.interviewsService.updateInterviewers(id, updateData.interviewers);
  }
}
