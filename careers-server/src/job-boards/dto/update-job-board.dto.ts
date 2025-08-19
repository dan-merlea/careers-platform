import { PartialType } from '@nestjs/mapped-types';
import { CreateJobBoardDto } from './create-job-board.dto';

export class UpdateJobBoardDto extends PartialType(CreateJobBoardDto) {}
