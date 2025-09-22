import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { LogAction } from 'src/user-logs/user-logs.interceptor';

@Controller('company/departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @LogAction('create_department', 'department')
  create(
    @Body() createDepartmentDto: CreateDepartmentDto,
    @Request() req: { user: { companyId: string } },
  ) {
    // Add company ID to the department data
    const departmentWithCompany = {
      ...createDepartmentDto,
      companyId: req.user.companyId,
    };
    return this.departmentService.create(departmentWithCompany);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECRUITER)
  findAll(@Request() req: { user: { companyId: string } }) {
    return this.departmentService.findAll(req.user.companyId);
  }

  @Get('hierarchy')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECRUITER, UserRole.USER)
  getHierarchy(@Request() req: { user: { companyId: string } }) {
    return this.departmentService.getHierarchy(req.user.companyId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECRUITER)
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ) {
    return this.departmentService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @LogAction('update_department', 'department')
  update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @Request() req: { user: { companyId: string } },
  ) {
    // First verify the department belongs to this company
    return this.departmentService.findOne(id, req.user.companyId).then(() => {
      // Add company ID to ensure it doesn't change
      const updateData = {
        ...updateDepartmentDto,
        companyId: req.user.companyId,
      };
      return this.departmentService.update(id, updateData);
    });
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @LogAction('delete_department', 'department')
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ) {
    // First verify the department belongs to this company
    await this.departmentService.findOne(id, req.user.companyId);
    await this.departmentService.remove(id);
    return { success: true, message: 'Department deleted successfully' };
  }
}
