import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InterviewProcessService } from './interview-process.service';
import type {
  InterviewProcessCreateDto,
  InterviewProcessUpdateDto,
  InterviewProcessResponseDto,
} from './interview-process.model';
import { InterviewProcessDocument } from './interview-process.entity';

@Controller('interview-processes')
@UseGuards(AuthGuard('jwt'))
export class InterviewProcessController {
  constructor(
    private readonly interviewProcessService: InterviewProcessService,
  ) {}

  @Get()
  async findAll(
    @Req() req: { user: { companyId: string } },
  ): Promise<InterviewProcessResponseDto[]> {
    const processes = await this.interviewProcessService.findAll(
      req.user.companyId,
    );
    return processes.map((process) => this.mapToResponseDto(process));
  }

  @Get('job-role/:jobRoleId')
  async findByJobRole(
    @Param('jobRoleId') jobRoleId: string,
  ): Promise<InterviewProcessResponseDto[]> {
    const processes =
      await this.interviewProcessService.findByJobRole(jobRoleId);
    return processes.map((process) => this.mapToResponseDto(process));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<InterviewProcessResponseDto> {
    const process = await this.interviewProcessService.findOne(id);
    return this.mapToResponseDto(process);
  }

  @Post()
  @LogAction('create_interview_process', 'interview_process')
  async create(
    @Body() createDto: InterviewProcessCreateDto,
    @Req() req: { user: { companyId: string; userId: string } },
  ): Promise<InterviewProcessResponseDto> {
    const process = await this.interviewProcessService.create(
      createDto,
      req.user.userId,
      req.user.companyId,
    );
    return this.mapToResponseDto(process);
  }

  @Put(':id')
  @LogAction('update_interview_process', 'interview_process')
  async update(
    @Param('id') id: string,
    @Body() updateDto: InterviewProcessUpdateDto,
  ): Promise<InterviewProcessResponseDto> {
    const process = await this.interviewProcessService.update(id, updateDto);
    return this.mapToResponseDto(process);
  }

  @Delete(':id')
  @LogAction('delete_interview_process', 'interview_process')
  async remove(@Param('id') id: string): Promise<void> {
    return this.interviewProcessService.remove(id);
  }

  private mapToResponseDto(
    process: InterviewProcessDocument,
  ): InterviewProcessResponseDto {
    const jobRole = process.jobRoleId as any;
    const company = process.companyId as any;
    const createdBy = process.createdBy as any;

    return {
      id: String(process._id),
      jobRole: {
        id: jobRole?._id ? String(jobRole._id) : '',
        title: jobRole?.title || '',
      },
      stages: process.stages.map((stage) => ({
        title: stage.title,
        description: stage.description,
        considerations: stage.considerations.map((consideration) => {
          // Handle both string and object considerations for backward compatibility
          if (typeof consideration === 'string') {
            return { title: consideration, description: consideration };
          }
          return consideration;
        }),
        emailTemplate: stage.emailTemplate,
        order: stage.order,
      })),
      company: {
        id: company?._id ? String(company._id) : '',
        name: company?.name || '',
      },
      createdBy: createdBy
        ? {
            id: createdBy._id ? String(createdBy._id) : '',
            name: createdBy.name || '',
            email: createdBy.email || '',
          }
        : undefined,
      createdAt: process.createdAt,
      updatedAt: process.updatedAt,
    };
  }
}
