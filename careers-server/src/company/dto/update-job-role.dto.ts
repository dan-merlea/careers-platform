import { IsString } from 'class-validator';

export class UpdateJobRoleDto {
  @IsString()
  title?: string;
}
