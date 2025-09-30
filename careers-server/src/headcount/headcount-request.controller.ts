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
  ForbiddenException,
} from '@nestjs/common';
import { HeadcountRequestService } from './headcount-request.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';
import { HeadcountRequest } from './headcount-request.model';
import { UserRole } from '../users/schemas/user.schema';
import { LogAction } from 'src/user-logs/user-logs.interceptor';

@Controller('headcount-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HeadcountRequestController {
  constructor(
    private readonly headcountRequestService: HeadcountRequestService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @LogAction('create_headcount_request', 'headcount_request')
  async create(
    @Body() createHeadcountRequestDto: any,
    @Req() req,
  ): Promise<HeadcountRequest> {
    return this.headcountRequestService.create(
      createHeadcountRequestDto,
      req.user.userId,
      req.user.companyId,
    );
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  async findAll(@Req() req): Promise<HeadcountRequest[]> {
    // Admin and directors can see all requests for their company
    if (
      req.user.role === UserRole.ADMIN ||
      req.user.role === UserRole.DIRECTOR
    ) {
      return this.headcountRequestService.findAll({}, req.user.companyId);
    }

    // Managers can only see their own requests
    return this.headcountRequestService.findByUser(
      req.user.userId,
      req.user.companyId,
    );
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  async findOne(
    @Param('id') id: string,
    @Req() req,
  ): Promise<HeadcountRequest> {
    const headcountRequest = await this.headcountRequestService.findOne(
      id,
      req.user.companyId,
    );

    // Check if user has permission to view this request
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.DIRECTOR &&
      headcountRequest.requestedBy.toString() !== req.user.userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to view this headcount request',
      );
    }

    return headcountRequest;
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  @LogAction('update_headcount_request', 'headcount_request')
  async update(
    @Param('id') id: string,
    @Body() updateHeadcountRequestDto: any,
    @Req() req,
  ): Promise<HeadcountRequest> {
    const headcountRequest = await this.headcountRequestService.findOne(
      id,
      req.user.companyId,
    );

    // Only the creator or admin can update a request
    if (
      req.user.role !== UserRole.ADMIN &&
      headcountRequest.requestedBy.toString() !== req.user.userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this headcount request',
      );
    }

    // Cannot update if already approved/rejected
    if (
      headcountRequest.status !== 'pending' &&
      req.user.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException(
        'Cannot update a headcount request that has already been reviewed',
      );
    }

    return this.headcountRequestService.update(
      id,
      updateHeadcountRequestDto,
      req.user.companyId,
    );
  }

  @Post(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR)
  @LogAction('approve_headcount_request', 'headcount_request')
  async approve(
    @Param('id') id: string,
    @Body('reviewNotes') reviewNotes: string,
    @Req() req,
  ): Promise<HeadcountRequest> {
    return this.headcountRequestService.approve(
      id,
      req.user.userId,
      req.user.companyId,
      reviewNotes,
    );
  }

  @Post(':id/reject')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR)
  @LogAction('reject_headcount_request', 'headcount_request')
  async reject(
    @Param('id') id: string,
    @Body('reviewNotes') reviewNotes: string,
    @Req() req,
  ): Promise<HeadcountRequest> {
    return this.headcountRequestService.reject(
      id,
      req.user.userId,
      req.user.companyId,
      reviewNotes,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @LogAction('delete_headcount_request', 'headcount_request')
  async remove(@Param('id') id: string, @Req() req): Promise<void> {
    return this.headcountRequestService.remove(id, req.user.companyId);
  }
}
