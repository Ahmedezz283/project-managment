// flowable.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FlowableService } from './flowable-services.js';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        baseURL: config.get<string>('FLOWABLE_API_URL'),
        headers: {
          Authorization: config.get<string>('FLOWABLE_AUTH'),
        },
      }),
    }),
  ],
  providers: [FlowableService],
  exports: [FlowableService],
})
export class FlowableModule {}