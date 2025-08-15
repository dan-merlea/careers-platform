import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User, UserDocument } from './schemas/user.schema';
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

    // Create new user with hashed password
    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    return {
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
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

    // Generate JWT token
    const token = this.authService.generateToken({
      sub: user._id,
      email: user.email,
    });

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
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
}
