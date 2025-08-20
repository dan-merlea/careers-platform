import { IsString, IsOptional, IsMongoId } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  title: string;

  @IsMongoId()
  @IsOptional()
  parentDepartment?: string;
}
