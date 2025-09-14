import { IsNotEmpty } from 'class-validator';

export class UpdateApplicationStatusDto {
  @IsNotEmpty()
  status: string;
}
