import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import telegramConfig from './config/telegram.config';
import { TelegramService } from './telegram.service';
import { TelegramClient } from './telegram.client';
import { HttpTelegramClient } from './http-telegram.client';
import { TelegramController } from './telegram.controller';

@Module({
  imports: [ConfigModule.forFeature(telegramConfig)],
  controllers: [TelegramController],
  providers: [
    TelegramService,
    {
      provide: TelegramClient,
      useClass: HttpTelegramClient,
    },
  ],
  exports: [TelegramService],
})
export class TelegramModule {}
