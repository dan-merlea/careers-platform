import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOfficeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  address: string;
}
