import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDepartmentDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  headCount?: number;

  @IsMongoId()
  @IsOptional()
  parentDepartment?: string;

  @IsString()
  @IsOptional()
  manager?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
