import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobBoardsService } from './job-boards.service';
import { JobBoardsController } from './job-boards.controller';
import { JobBoard, JobBoardSchema } from './schemas/job-board.schema';
import { Job, JobSchema } from '../job/job.entity';
import { ApiKey, ApiKeySchema } from '../api-keys/api-keys.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JobBoard.name, schema: JobBoardSchema },
      { name: Job.name, schema: JobSchema },
      { name: ApiKey.name, schema: ApiKeySchema },
    ]),
  ],
  controllers: [JobBoardsController],
  providers: [JobBoardsService],
  exports: [JobBoardsService],
})
export class JobBoardsModule {}
