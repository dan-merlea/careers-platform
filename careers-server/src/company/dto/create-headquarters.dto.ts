import { IsString } from 'class-validator';

export class CreateHeadquartersDto {
  @IsString()
  name: string;

  @IsString()
  address: string;
}
