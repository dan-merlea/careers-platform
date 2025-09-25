import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

import { JobApplication, JobApplicationSchema } from '../job-applications/schemas/job-application.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

import { AnalyticsController } from './controllers/analytics.controller';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsAggregatorService } from './services/analytics-aggregator.service';
import { AnalyticsInterceptor } from './interceptors/analytics.interceptor';
import { AnalyticsMetrics, AnalyticsMetricsSchema } from './schemas/analytics-metrics.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AnalyticsMetrics.name, schema: AnalyticsMetricsSchema },
      { name: JobApplication.name, schema: JobApplicationSchema },
      { name: User.name, schema: UserSchema },
    ]),
    ScheduleModule.forRoot(),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        ttl: 900, // 15 minutes default TTL
      }),
    }),
  ],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    AnalyticsAggregatorService,
    AnalyticsInterceptor,
  ],
  exports: [
    AnalyticsService,
    AnalyticsAggregatorService,
  ],
})
export class AnalyticsModule {}
