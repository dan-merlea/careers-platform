import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HeadcountRequestService } from './headcount-request.service';
import { HeadcountRequestController } from './headcount-request.controller';
import { HeadcountRequest, HeadcountRequestSchema } from './headcount-request.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HeadcountRequest.name, schema: HeadcountRequestSchema },
    ]),
  ],
  controllers: [HeadcountRequestController],
  providers: [HeadcountRequestService],
  exports: [HeadcountRequestService],
})
export class HeadcountModule {}
