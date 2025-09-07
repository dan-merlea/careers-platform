import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class CompanySignupDto {
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  // Convert to CreateUserDto for backward compatibility
  toCreateUserDto(): CreateUserDto {
    return {
      email: this.email,
      password: this.password,
      firstName: this.name.split(' ')[0],
      lastName: this.name.split(' ').slice(1).join(' ') || '',
    };
  }
}
