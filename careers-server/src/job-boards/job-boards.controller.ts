import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JobBoardsService } from './job-boards.service';
import { CreateJobBoardDto } from './dto/create-job-board.dto';
import { UpdateJobBoardDto } from './dto/update-job-board.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth';
import { UserRole } from '../users/schemas/user.schema';
import { LogAction } from 'src/user-logs/user-logs.interceptor';

@Controller('job-boards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JobBoardsController {
  constructor(private readonly jobBoardsService: JobBoardsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @LogAction('create_job_board', 'job_board')
  create(
    @Body() createJobBoardDto: CreateJobBoardDto,
    @Req() req: { user: { companyId: string } },
  ) {
    // Add company ID from authenticated user
    return this.jobBoardsService.create({
      ...createJobBoardDto,
      companyId: req.user.companyId,
    });
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECRUITER)
  findAll(@Req() req: { user: { companyId: string } }) {
    // Filter by company ID
    return this.jobBoardsService.findAll(req.user.companyId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECRUITER)
  findOne(
    @Param('id') id: string,
    @Req() req: { user: { companyId: string } },
  ) {
    // Verify job board belongs to company
    return this.jobBoardsService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @LogAction('update_job_board', 'job_board')
  update(
    @Param('id') id: string,
    @Body() updateJobBoardDto: UpdateJobBoardDto,
    @Req() req: { user: { companyId: string } },
  ) {
    // Verify job board belongs to company
    return this.jobBoardsService.update(
      id,
      updateJobBoardDto,
      req.user.companyId,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @LogAction('delete_job_board', 'job_board')
  remove(@Param('id') id: string, @Req() req: { user: { companyId: string } }) {
    // Verify job board belongs to company
    return this.jobBoardsService.remove(id, req.user.companyId);
  }

  @Post('external/:source')
  @Roles(UserRole.ADMIN)
  @LogAction('create_external_job_board', 'job_board')
  createExternalJobBoard(
    @Param('source') source: 'greenhouse' | 'ashby',
    @Req() req: { user: { companyId: string } },
  ) {
    // Add company ID from authenticated user
    return this.jobBoardsService.createExternalJobBoard(
      source,
      req.user.companyId,
    );
  }

  @Post(':id/refresh')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR)
  @LogAction('refresh_ats_jobs', 'job_board')
  async refreshJobsFromATS(
    @Param('id') id: string,
    @Req() req: { user: { companyId: string; userId: string } },
  ) {
    return this.jobBoardsService.refreshJobsFromATS(
      id,
      req.user.companyId,
      req.user.userId,
    );
  }
}
