import { Inject, Injectable, Logger } from '@nestjs/common';
import telegramConfig from './config/telegram.config';
import type { ConfigType } from '@nestjs/config';
import { TelegramClient } from './telegram.client';
import { BotType } from './interface/bottype.interface';
import { AppError } from 'src/common/filters/exceptions/app-exceptions';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class HttpTelegramClient extends TelegramClient {
  private readonly logger = new Logger(HttpTelegramClient.name);

  constructor(
    @Inject(telegramConfig.KEY)
    private readonly cfg: ConfigType<typeof telegramConfig>,
  ) {
    super();
  }

  async sendMessage(input: {
    chatId: string;
    text: string;
    botType: BotType;
    title: string;
  }): Promise<void> {
    const chave =
      input.botType === 'alert'
        ? this.cfg.botTokenAlert
        : input.botType === 'admin'
          ? this.cfg.botTokenAdm
          : null;

    const hoje = new Date().toISOString().slice(0, 10);
    const logsDir = path.join(process.cwd(), 'logs', 'telegram');
    const logFile = path.join(logsDir, `${hoje}.json`);

    if (!chave) {
      await this.salvarLog(logFile, {
        data: new Date().toLocaleDateString('pt-BR'),
        hora: new Date().toLocaleTimeString('pt-BR'),
        status: 'ERROR',
        botType: input.botType,
        chatId: input.chatId,
        error: 'Token não validado',
      });

      AppError.ServerErro({
        message: 'Token do bot inválido',
        messageType: 'alerta',
        telegram: true,
      });
    }

    const url = `${this.cfg.baseUrl}/bot${chave}/sendMessage`;

    const body = {
      chat_id: input.chatId,
      text: input.text,
      parse_mode: this.cfg.parseMode,
      disable_web_page_preview: this.cfg.disableWebPagePreview,
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const raw = await res.text().catch(() => '');

        await this.salvarLog(logFile, {
          data: new Date().toLocaleDateString('pt-BR'),
          hora: new Date().toLocaleTimeString('pt-BR'),
          status: 'ERROR',
          botType: input.botType,
          chatId: input.chatId,
          error: `HTTP ${res.status} ${raw}`,
        });

        AppError.ServerErro({
          message:
            'Chave de Token nao foi validada o tipo de Boot correto, verificar servidor Boot',
          messageType: 'alerta',
          telegram: true,
        });
      }

      await this.salvarLog(logFile, {
        data: new Date().toLocaleDateString('pt-BR'),
        hora: new Date().toLocaleTimeString('pt-BR'),
        status: 'SENT',
        botType: input.botType,
        chatId: input.chatId,
        title: input.title,
      });
    } catch (error: any) {
      await this.salvarLog(logFile, {
        data: new Date().toLocaleDateString('pt-BR'),
        hora: new Date().toLocaleTimeString('pt-BR'),
        status: 'ERROR',
        botType: input.botType,
        chatId: input.chatId,
        error: error?.message ?? 'Erro desconhecido',
      });
      throw error;
    }
  }

  private async salvarLog(filePath: string, item: any) {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    let arr: any[] = [];

    try {
      const raw = await fs.readFile(filePath, 'utf8');
      arr = raw?.trim() ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) arr = [];
    } catch {
      arr = [];
    }

    arr.push(item);

    await fs.writeFile(filePath, JSON.stringify(arr, null, 2), 'utf8');
  }
}
