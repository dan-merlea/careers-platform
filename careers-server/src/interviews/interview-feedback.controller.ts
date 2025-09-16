import { Body, Controller, ForbiddenException, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InterviewsService } from './interviews.service';
import type { Request } from 'express';

interface FeedbackDto {
  interviewId: string;
  interviewerId: string;
  interviewerName: string;
  rating: number;
  comments: string;
  decision: string;
  considerations: { [key: string]: number };
}

@ApiTags('interview-feedback')
@Controller('interviews')
@UseGuards(JwtAuthGuard)
export class InterviewFeedbackController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Get(':id/feedback')
  @ApiOperation({ summary: 'Get all feedback for an interview' })
  @ApiResponse({ status: 200, description: 'Returns all feedback for the interview' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async getInterviewFeedback(@Param('id') id: string) {
    return this.interviewsService.getInterviewFeedback(id);
  }

  @Get(':id/feedback/:interviewerId')
  @ApiOperation({ summary: 'Get feedback by interviewer' })
  @ApiResponse({ status: 200, description: 'Returns feedback from the specified interviewer' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async getInterviewerFeedback(
    @Param('id') id: string,
    @Param('interviewerId') interviewerId: string,
  ) {
    return this.interviewsService.getInterviewerFeedback(id, interviewerId);
  }

  @Post(':id/feedback')
  @ApiOperation({ summary: 'Submit feedback for an interview' })
  @ApiResponse({ status: 201, description: 'Feedback submitted successfully' })
  @ApiResponse({ status: 403, description: 'User is not an interviewer for this interview' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async submitFeedback(
    @Param('id') id: string,
    @Body() feedbackDto: FeedbackDto,
    @Req() request: Request,
  ) {
    // Get the user ID from the JWT token
    if (!request.user) {
      throw new ForbiddenException('User not authenticated');
    }
    const userId = request.user['userId'];
    
    // Validate that the user is an interviewer for this interview
    const interview = await this.interviewsService.getInterviewById(id);
    
    // Check if the user is an interviewer for this interview
    const isInterviewer = interview.interviewers.some(
      interviewer => interviewer.userId === userId
    );
    
    if (!isInterviewer) {
      throw new ForbiddenException('You are not an interviewer for this interview');
    }
    
    // Ensure the interviewerId in the feedback matches the current user
    if (feedbackDto.interviewerId !== userId) {
      throw new ForbiddenException('You can only submit feedback as yourself');
    }
    
    return this.interviewsService.submitFeedback(id, feedbackDto);
  }

  @Put(':id/feedback/:interviewerId')
  @ApiOperation({ summary: 'Update feedback for an interview' })
  @ApiResponse({ status: 200, description: 'Feedback updated successfully' })
  @ApiResponse({ status: 403, description: 'User is not an interviewer for this interview' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async updateFeedback(
    @Param('id') id: string,
    @Param('interviewerId') interviewerId: string,
    @Body() feedbackDto: FeedbackDto,
    @Req() request: Request,
  ) {
    // Get the user ID from the JWT token
    if (!request.user) {
      throw new ForbiddenException('User not authenticated');
    }
    const userId = request.user['userId'];
    
    // Validate that the user is updating their own feedback
    if (interviewerId !== userId) {
      throw new ForbiddenException('You can only update your own feedback');
    }
    
    // Validate that the user is an interviewer for this interview
    const interview = await this.interviewsService.getInterviewById(id);
    
    // Check if the user is an interviewer for this interview
    const isInterviewer = interview.interviewers.some(
      interviewer => interviewer.userId === userId
    );
    
    if (!isInterviewer) {
      throw new ForbiddenException('You are not an interviewer for this interview');
    }
    
    return this.interviewsService.updateFeedback(id, interviewerId, feedbackDto);
  }

  @Post(':id/feedback/:interviewerId/remind')
  @ApiOperation({ summary: 'Send reminder to interviewer to submit feedback' })
  @ApiResponse({ status: 200, description: 'Reminder sent successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to send reminders' })
  @ApiResponse({ status: 404, description: 'Interview or interviewer not found' })
  async sendFeedbackReminder(
    @Param('id') id: string,
    @Param('interviewerId') interviewerId: string,
    @Req() request: Request,
  ) {
    // Get the user ID from the JWT token
    if (!request.user) {
      throw new ForbiddenException('User not authenticated');
    }
    const userId = request.user['userId'];
    
    // Only recruiters, hiring managers, and admins can send reminders
    const userRole = request.user['role'];
    if (!['recruiter', 'hiring_manager', 'admin'].includes(userRole)) {
      throw new ForbiddenException('Only recruiters, hiring managers, and admins can send reminders');
    }
    
    return this.interviewsService.sendFeedbackReminder(id, interviewerId);
  }
}
