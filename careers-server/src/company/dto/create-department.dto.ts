import {
  IsString,
  IsOptional,
  IsMongoId,
  IsArray,
  IsEnum,
} from 'class-validator';
import { UserRole } from '../../users/schemas/user.schema';

export class CreateDepartmentDto {
  @IsString()
  title: string;

  @IsMongoId()
  @IsOptional()
  parentDepartment?: string;

  @IsEnum(UserRole)
  @IsOptional()
  approvalRole?: UserRole;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  jobRoles?: string[];
}
