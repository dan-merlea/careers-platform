import { PartialType } from '@nestjs/mapped-types';
import { CreateHeadquartersDto } from './create-headquarters.dto';

export class UpdateHeadquartersDto extends PartialType(CreateHeadquartersDto) {}
