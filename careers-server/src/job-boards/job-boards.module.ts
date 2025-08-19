import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobBoardsService } from './job-boards.service';
import { JobBoardsController } from './job-boards.controller';
import { JobBoard, JobBoardSchema } from './schemas/job-board.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JobBoard.name, schema: JobBoardSchema },
    ]),
  ],
  controllers: [JobBoardsController],
  providers: [JobBoardsService],
  exports: [JobBoardsService],
})
export class JobBoardsModule {}
