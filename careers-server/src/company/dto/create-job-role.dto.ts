import { IsNotEmpty, IsString } from 'class-validator';

export class CreateJobRoleDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  jobFunction: string;
}
