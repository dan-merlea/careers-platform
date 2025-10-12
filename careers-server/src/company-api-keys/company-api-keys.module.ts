import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyApiKeysController } from './company-api-keys.controller';
import { CompanyApiKeysService } from './company-api-keys.service';
import { CompanyApiKey, CompanyApiKeySchema } from './schemas/company-api-key.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CompanyApiKey.name, schema: CompanyApiKeySchema },
    ]),
  ],
  controllers: [CompanyApiKeysController],
  providers: [CompanyApiKeysService],
  exports: [CompanyApiKeysService],
})
export class CompanyApiKeysModule {}
