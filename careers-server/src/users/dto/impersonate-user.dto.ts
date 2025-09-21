import { IsNotEmpty, IsString } from 'class-validator';

export class ImpersonateUserDto {
  @IsNotEmpty()
  @IsString()
  userId: string;
}
