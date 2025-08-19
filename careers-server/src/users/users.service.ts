import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto) {
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

    // Create new user with hashed password
    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      role: isFirstUser ? UserRole.ADMIN : UserRole.USER,
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    return {
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
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

    // Generate JWT token with role information
    const token = this.authService.generateToken({
      sub: user._id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
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
}
