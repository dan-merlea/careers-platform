import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanySignupsController } from './company-signups.controller';
import { CompanySignupsService } from './company-signups.service';
import { CompanySignup, CompanySignupSchema } from './schemas/company-signup.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CompanySignup.name, schema: CompanySignupSchema },
    ]),
  ],
  controllers: [CompanySignupsController],
  providers: [CompanySignupsService],
  exports: [CompanySignupsService],
})
export class CompanySignupsModule {}
