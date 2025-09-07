import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';
import { IntegrationType } from './api-keys.schema';
import { UserRole } from '../users/schemas/user.schema';

@Controller('api-keys')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  create(@Req() req, @Body() createApiKeyDto: CreateApiKeyDto) {
    return this.apiKeysService.create(req.user.userId, req.user.companyId, createApiKeyDto);
  }

  @Get()
  findAll(@Req() req) {
    return this.apiKeysService.findAllForUser(req.user.userId, req.user.companyId);
  }

  @Get(':type')
  findOne(@Req() req, @Param('type') type: IntegrationType) {
    return this.apiKeysService.findOneByType(req.user.userId, req.user.companyId, type);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.apiKeysService.remove(req.user.userId, req.user.companyId, id);
  }
}
