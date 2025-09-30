import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CompanySignupDto } from './dto/company-signup.dto';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { AuthService } from '../auth/auth.service';
import { Company } from '../company/company.schema';
import { JobFunctionService } from '../company/job-function.service';
import { DepartmentService } from '../company/department.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Company.name) private companyModel: Model<Company>,
    private authService: AuthService,
    private jobFunctionService: JobFunctionService,
    private departmentService: DepartmentService,
  ) {}

  async create(createUserDto: CreateUserDto, companyId?: string) {
    // Check if user already exists
    const existingUser = await this.userModel
      .findOne({ email: createUserDto.email })
      .exec();

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await this.authService.hashPassword(
      createUserDto.password,
    );

    // Check if this is the first user (make them admin)
    const userCount = await this.userModel.countDocuments().exec();
    const isFirstUser = userCount === 0;

    if (!companyId && !isFirstUser) {
      throw new Error('Company ID is required for non-admin users');
    }

    // Create new user with hashed password
    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      role: isFirstUser ? UserRole.ADMIN : UserRole.USER,
      companyId: companyId || null, // For the first admin user, companyId might be null initially
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    return {
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      departmentId: savedUser.departmentId,
      companyId: savedUser.companyId,
    };
  }

  async companySignup(companySignupDto: CompanySignupDto) {
    // First, create the company
    const newCompany = new this.companyModel({
      name: companySignupDto.companyName,
    });

    const savedCompany = await newCompany.save();

    // Then create the user with admin role for this company
    // Create a CreateUserDto manually from the CompanySignupDto fields
    const createUserDto = {
      email: companySignupDto.email,
      password: companySignupDto.password,
      firstName: companySignupDto.name.split(' ')[0],
      lastName: companySignupDto.name.split(' ').slice(1).join(' ') || '',
      name: companySignupDto.name, // Add the full name for the User schema
    };

    // Create the user with the company ID
    // Ensure we have a valid string ID
    const companyId = savedCompany._id ? String(savedCompany._id) : '';
    const user = await this.create(createUserDto, companyId);

    // Update the user to be an admin
    if (user && user.id) {
      await this.updateRole(String(user.id), UserRole.ADMIN);
    }
    
    // Create default job functions and departments for the company
    try {
      await this.jobFunctionService.createDefaultJobFunctions(companyId);
      await this.departmentService.createDefaultDepartments(companyId);
    } catch (error) {
      console.error('Error creating default company data:', error);
      // We don't throw here to avoid failing the signup process
      // The user can still create these manually if needed
    }

    // Generate JWT token with role information and company ID
    const token = this.authService.generateToken({
      sub: user.id,
      email: user.email,
      role: UserRole.ADMIN,
      companyId: String(savedCompany._id),
    });

    return {
      token,
      company: {
        id: String(savedCompany._id),
        name: savedCompany.name,
      },
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: UserRole.ADMIN,
        companyId: String(savedCompany._id),
      },
    };
  }

  async login(loginUserDto: LoginUserDto) {
    // Find the user by email
    const user = await this.userModel
      .findOne({ email: loginUserDto.email })
      .exec();

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.authService.comparePasswords(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token with role information and company ID
    const token = this.authService.generateToken({
      sub: user._id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    });

    // Return only the token; the client should call /auth/me to fetch user details
    return { token };
  }

  async resetPassword(email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      throw new Error('User not found');
    }

    // In a real app, you would generate a reset token and send an email
    // For now, we'll just return a success message
    return {
      message: 'Password reset instructions sent to your email',
    };
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findAll() {
    const users = await this.userModel.find().exec();
    return users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
    }));
  }

  async updateRole(id: string, role: string) {
    // Validate that the role is a valid UserRole
    if (!Object.values(UserRole).includes(role as UserRole)) {
      throw new Error('Invalid role');
    }

    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new Error('User not found');
    }

    user.role = role as UserRole;
    const updatedUser = await user.save();

    return {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      departmentId: updatedUser.departmentId,
    };
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new Error('User not found');
    }

    // Check if email is being updated and if it's already in use
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.userModel
        .findOne({ email: updateProfileDto.email })
        .exec();

      if (existingUser) {
        throw new Error('Email is already in use');
      }
    }

    // Update user fields
    if (updateProfileDto.name) {
      user.name = updateProfileDto.name;
    }
    if (updateProfileDto.email) {
      user.email = updateProfileDto.email;
    }

    const updatedUser = await user.save();

    return {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      departmentId: updatedUser.departmentId,
      createdAt: updatedUser.createdAt,
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await this.authService.comparePasswords(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash the new password
    const hashedPassword = await this.authService.hashPassword(
      changePasswordDto.newPassword,
    );

    // Update password
    user.password = hashedPassword;
    await user.save();

    return { message: 'Password updated successfully' };
  }

  async updateDepartment(userId: string, departmentId: string | null) {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new Error('User not found');
    }

    // Update department
    user.departmentId = departmentId;
    const updatedUser = await user.save();

    return {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      departmentId: updatedUser.departmentId,
    };
  }

  /**
   * Impersonate a user (admin only)
   * @param adminId ID of the admin user who is impersonating
   * @param userId ID of the user to impersonate
   * @returns Authentication data for the impersonated user with admin info
   */
  async impersonateUser(adminId: string, userId: string) {
    // Find the admin user
    const adminUser = await this.userModel.findById(adminId).exec();
    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    // Verify the admin has appropriate permissions
    if (adminUser.role !== UserRole.ADMIN) {
      throw new Error('Only administrators can impersonate users');
    }

    // Find the user to impersonate
    const userToImpersonate = await this.userModel.findById(userId).exec();
    if (!userToImpersonate) {
      throw new Error('User to impersonate not found');
    }

    // Get company information if available
    let companyData: { id: string; name: string } | null = null;
    if (userToImpersonate.companyId) {
      const company = await this.companyModel
        .findById(userToImpersonate.companyId)
        .exec();
      if (company) {
        companyData = {
          id: String(company._id),
          name: company.name,
        };
      }
    }

    // Generate JWT token with role information, company ID, and impersonation data
    const token = this.authService.generateToken({
      sub: userToImpersonate._id,
      email: userToImpersonate.email,
      role: userToImpersonate.role,
      companyId: userToImpersonate.companyId,
      impersonatedBy: {
        id: adminUser._id,
        email: adminUser.email,
        name: adminUser.name,
      },
    });

    return {
      token,
      user: {
        id: userToImpersonate._id,
        email: userToImpersonate.email,
        name: userToImpersonate.name,
        role: userToImpersonate.role,
        departmentId: userToImpersonate.departmentId,
        companyId: userToImpersonate.companyId,
      },
      company: companyData,
      impersonatedBy: {
        id: adminUser._id,
        email: adminUser.email,
        name: adminUser.name,
      },
    };
  }
}
