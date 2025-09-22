import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Param,
  UseGuards,
  HttpStatus,
  HttpException,
  Request,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';
import { UserRole } from './schemas/user.schema';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CompanySignupDto } from './dto/company-signup.dto';
import { ImpersonateUserDto } from './dto/impersonate-user.dto';
import { LogAction } from '../user-logs/user-logs.interceptor';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllUsers() {
    try {
      return await this.usersService.findAll();
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('An error occurred', HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @LogAction('update_user_role', 'user')
  async updateUserRole(
    @Param('id') id: string,
    @Body() updateRoleDto: { role: string },
  ) {
    try {
      return await this.usersService.updateRole(id, updateRoleDto.role);
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('An error occurred', HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':id/department')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @LogAction('update_user_department', 'user')
  async updateUserDepartment(
    @Param('id') id: string,
    @Body() updateDepartmentDto: { departmentId: string | null },
  ) {
    try {
      return await this.usersService.updateDepartment(
        id,
        updateDepartmentDto.departmentId,
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('An error occurred', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('signup')
  @LogAction('signup', 'user')
  async signup(
    @Body() createUserDto: CreateUserDto,
    @Query('companyId') companyId?: string,
  ) {
    try {
      return await this.usersService.create(createUserDto, companyId);
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('An error occurred', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('company-signup')
  async companySignup(@Body() companySignupDto: CompanySignupDto) {
    try {
      return await this.usersService.companySignup(companySignupDto);
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('An error occurred', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  @LogAction('login', 'user')
  async login(@Body() loginUserDto: LoginUserDto) {
    try {
      return await this.usersService.login(loginUserDto);
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
      }
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: { email: string }) {
    try {
      return await this.usersService.resetPassword(resetPasswordDto.email);
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('An error occurred', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: { user: { userId: string } }) {
    try {
      return await this.usersService.getProfile(req.user.userId);
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('An error occurred', HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @LogAction('update_profile', 'user')
  async updateProfile(
    @Request() req: { user: { userId: string } },
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    try {
      return await this.usersService.updateProfile(
        req.user.userId,
        updateProfileDto,
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('An error occurred', HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @LogAction('change_password', 'user')
  async changePassword(
    @Request() req: { user: { userId: string } },
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    try {
      return await this.usersService.changePassword(
        req.user.userId,
        changePasswordDto,
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('An error occurred', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Impersonate a user (admin only)
   */
  @Post('impersonate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @LogAction('impersonate_user', 'user')
  async impersonateUser(
    @Request() req: { user: { userId: string } },
    @Body() impersonateUserDto: ImpersonateUserDto,
  ) {
    try {
      // Check if the requesting user is an admin
      if (req.user.userId === impersonateUserDto.userId) {
        throw new ForbiddenException('Cannot impersonate yourself');
      }

      return await this.usersService.impersonateUser(
        req.user.userId,
        impersonateUserDto.userId,
      );
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('An error occurred', HttpStatus.BAD_REQUEST);
    }
  }
}
