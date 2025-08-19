import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { CompanyModule } from './company/company.module';
import { JobBoardsModule } from './job-boards/job-boards.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/dev_careers'),
    UsersModule,
    ApiKeysModule,
    CompanyModule,
    JobBoardsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
