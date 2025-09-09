import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InterviewProcess, InterviewProcessSchema } from './interview-process.entity';
import { InterviewProcessService } from './interview-process.service';
import { InterviewProcessController } from './interview-process.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InterviewProcess.name, schema: InterviewProcessSchema },
    ]),
  ],
  controllers: [InterviewProcessController],
  providers: [InterviewProcessService],
  exports: [InterviewProcessService],
})
export class InterviewsModule {}
