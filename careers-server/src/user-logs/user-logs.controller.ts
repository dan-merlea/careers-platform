import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { UserLogsService } from './user-logs.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';
import { UserRole } from '../users/schemas/user.schema';

@Controller('user-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UserLogsController {
  constructor(private readonly userLogsService: UserLogsService) {}

  /**
   * Get all logs with pagination
   */
  @Get()
  async getAllLogs(@Query('page') page = '1', @Query('limit') limit = '20') {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    return this.userLogsService.getAllLogs(pageNum, limitNum);
  }

  /**
   * Get logs by user ID
   */
  @Get('user/:userId')
  async getLogsByUser(@Param('userId') userId: string) {
    return this.userLogsService.getLogsByUser(userId);
  }

  /**
   * Get logs by resource type and ID
   */
  @Get('resource/:resourceType/:resourceId')
  async getLogsByResource(
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
  ) {
    return this.userLogsService.getLogsByResource(resourceType, resourceId);
  }
}
