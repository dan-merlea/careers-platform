import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { JobBoardsService } from './job-boards.service';
import { CreateJobBoardDto } from './dto/create-job-board.dto';
import { UpdateJobBoardDto } from './dto/update-job-board.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('job-boards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JobBoardsController {
  constructor(private readonly jobBoardsService: JobBoardsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() createJobBoardDto: CreateJobBoardDto) {
    return this.jobBoardsService.create(createJobBoardDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECRUITER)
  findAll() {
    return this.jobBoardsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECRUITER)
  findOne(@Param('id') id: string) {
    return this.jobBoardsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(
    @Param('id') id: string,
    @Body() updateJobBoardDto: UpdateJobBoardDto,
  ) {
    return this.jobBoardsService.update(id, updateJobBoardDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.jobBoardsService.remove(id);
  }

  @Post('external/:source')
  @Roles(UserRole.ADMIN)
  createExternalJobBoard(@Param('source') source: 'greenhouse' | 'ashby') {
    return this.jobBoardsService.createExternalJobBoard(source);
  }
}
