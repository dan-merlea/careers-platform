import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';
import { UserRole } from '../users/schemas/user.schema';
import { DashboardService } from './dashboard.service';
import { CompanyId } from '../company/decorators/company-id.decorator';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(
    @CompanyId() companyId: string,
    @Request() req: { user: { userId: string } },
  ) {
    return await this.dashboardService.getStats(companyId, req.user.userId);
  }
}
