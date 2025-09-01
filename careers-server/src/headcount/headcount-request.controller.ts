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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { HeadcountRequest } from './headcount-request.model';
import { UserRole } from '../users/schemas/user.schema';

@Controller('headcount-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HeadcountRequestController {
  constructor(
    private readonly headcountRequestService: HeadcountRequestService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async create(
    @Body() createHeadcountRequestDto: any,
    @Req() req,
  ): Promise<HeadcountRequest> {
    return this.headcountRequestService.create(
      createHeadcountRequestDto,
      req.user.userId,
    );
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  async findAll(@Req() req): Promise<HeadcountRequest[]> {
    // Admin and directors can see all requests
    if (req.user.role === UserRole.ADMIN || req.user.role === UserRole.DIRECTOR) {
      return this.headcountRequestService.findAll();
    }

    // Managers can only see their own requests
    return this.headcountRequestService.findByUser(req.user.userId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  async findOne(
    @Param('id') id: string,
    @Req() req,
  ): Promise<HeadcountRequest> {
    const headcountRequest = await this.headcountRequestService.findOne(id);

    // Check if user has permission to view this request
    if (req.user.role !== UserRole.ADMIN && 
        req.user.role !== UserRole.DIRECTOR && 
        headcountRequest.requestedBy.toString() !== req.user.userId) {
      throw new ForbiddenException(
        'You do not have permission to view this headcount request',
      );
    }

    return headcountRequest;
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async update(
    @Param('id') id: string,
    @Body() updateHeadcountRequestDto: any,
    @Req() req,
  ): Promise<HeadcountRequest> {
    const headcountRequest = await this.headcountRequestService.findOne(id);

    // Only the creator or admin can update a request
    if (req.user.role !== UserRole.ADMIN && 
        headcountRequest.requestedBy.toString() !== req.user.userId) {
      throw new ForbiddenException(
        'You do not have permission to update this headcount request',
      );
    }

    // Cannot update if already approved/rejected
    if (headcountRequest.status !== 'pending' && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Cannot update a headcount request that has already been reviewed',
      );
    }

    return this.headcountRequestService.update(id, updateHeadcountRequestDto);
  }

  @Post(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR)
  async approve(
    @Param('id') id: string,
    @Body('reviewNotes') reviewNotes: string,
    @Req() req,
  ): Promise<HeadcountRequest> {
    return this.headcountRequestService.approve(
      id,
      req.user.userId,
      reviewNotes,
    );
  }

  @Post(':id/reject')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR)
  async reject(
    @Param('id') id: string,
    @Body('reviewNotes') reviewNotes: string,
    @Req() req,
  ): Promise<HeadcountRequest> {
    return this.headcountRequestService.reject(
      id,
      req.user.userId,
      reviewNotes,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string): Promise<void> {
    return this.headcountRequestService.remove(id);
  }
}
