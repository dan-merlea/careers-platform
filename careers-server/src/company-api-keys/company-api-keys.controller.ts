import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CompanyApiKeysService } from './company-api-keys.service';
import { CreateCompanyApiKeyDto } from './dto/create-company-api-key.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('company-api-keys')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanyApiKeysController {
  constructor(private readonly companyApiKeysService: CompanyApiKeysService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Request() req, @Body() createDto: CreateCompanyApiKeyDto) {
    const { apiKey, secretKey } = await this.companyApiKeysService.generateApiKey(
      req.user.companyId,
      req.user.userId,
      createDto.name,
      createDto.description,
    );

    return {
      apiKey: {
        id: (apiKey as any)._id,
        apiKey: apiKey.apiKey,
        name: apiKey.name,
        description: apiKey.description,
        isActive: apiKey.isActive,
        createdAt: apiKey.createdAt,
      },
      secretKey, // Only returned once
      warning: 'Save this secret key securely. It will not be shown again.',
    };
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR)
  async findAll(@Request() req) {
    const keys = await this.companyApiKeysService.findAll(req.user.companyId);
    
    return keys.map(key => ({
      id: (key as any)._id,
      apiKey: key.apiKey,
      name: key.name,
      description: key.description,
      isActive: key.isActive,
      lastUsedAt: key.lastUsedAt,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt,
    }));
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR)
  async findOne(@Request() req, @Param('id') id: string) {
    const key = await this.companyApiKeysService.findOne(id, req.user.companyId);
    
    return {
      id: (key as any)._id,
      apiKey: key.apiKey,
      name: key.name,
      description: key.description,
      isActive: key.isActive,
      lastUsedAt: key.lastUsedAt,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt,
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async delete(@Request() req, @Param('id') id: string) {
    await this.companyApiKeysService.delete(id, req.user.companyId);
    return { message: 'API key deleted successfully' };
  }

  @Patch(':id/toggle')
  @Roles(UserRole.ADMIN)
  async toggleActive(@Request() req, @Param('id') id: string) {
    const key = await this.companyApiKeysService.toggleActive(id, req.user.companyId);
    
    return {
      id: (key as any)._id,
      apiKey: key.apiKey,
      name: key.name,
      isActive: key.isActive,
    };
  }
}
