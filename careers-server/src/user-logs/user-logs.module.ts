import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserLogsService } from './user-logs.service';
import { UserLogsController } from './user-logs.controller';
import { UserLog, UserLogSchema } from './schemas/user-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserLog.name, schema: UserLogSchema }]),
  ],
  controllers: [UserLogsController],
  providers: [UserLogsService],
  exports: [UserLogsService],
})
export class UserLogsModule {}
