import { Inject, Injectable } from '@nestjs/common';
import telegramConfig from './config/telegram.config';
import type { ConfigType } from '@nestjs/config';
import { TelegramClient } from './telegram.client';
import { BotType } from './interface/bottype.interface';
import { AppError } from 'src/common/filters/exceptions/app-exceptions';

@Injectable()
export class TelegramService {
  constructor(
    private readonly client: TelegramClient,
    @Inject(telegramConfig.KEY)
    private readonly cfg: ConfigType<typeof telegramConfig>,
  ) {}

  
  private splitChatIds(ids: string): string[] {
    return String(ids || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  async sendToMany(msg: string, ids: string, botType: BotType, title:string) {
    const chatIds = this.splitChatIds(ids);

    if (chatIds.length === 0) {
      AppError.ServerErro({
        message: 'Nenhum chat_id informado',
        messageType: 'alerta',
      });
    }

    const results: { chatId: string; ok: boolean; error?: string }[] = [];

    for (const chatId of chatIds) {
      try {
        await this.client.sendMessage({ chatId, text: msg, botType, title });
        results.push({ chatId, ok: true });
      } catch (e: any) {
        results.push({
          chatId,
          ok: false,
          error: e?.message || 'Falha ao enviar',
        });
      }
    }

    const okCount = results.filter((r) => r.ok).length;
    return { ok: okCount > 0, okCount, total: results.length, results };
  }
}
