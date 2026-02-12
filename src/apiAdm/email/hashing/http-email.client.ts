import { Inject, Injectable } from '@nestjs/common';
import { EmailClient } from './email.client';
import emailConfig from '../config/email.config';
import type { ConfigType } from '@nestjs/config';
import { EmailInterface } from '../interface/email.interface';
import nodemailer from 'nodemailer';
import { promises as fs } from 'fs';
import * as path from 'path';
import { AppError } from 'src/common/filters/exceptions/app-exceptions';

@Injectable()
export class HttpEmailClient extends EmailClient {
  constructor(
    @Inject(emailConfig.KEY)
    private readonly smtp: ConfigType<typeof emailConfig>,
  ) {
    super();
  }

  async sendEmail(input: EmailInterface): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: this.smtp.HOST,
      port: this.smtp.PORT,
      secure: this.smtp.SECURE,
      auth: { user: this.smtp.USER, pass: this.smtp.PASS },
    });

    const hoje = new Date().toISOString().slice(0, 10);
    const logsDir = path.join(process.cwd(), 'logs', 'email');
    const logFile = path.join(logsDir, `${hoje}.jsonl`);

    try {
      await transporter.sendMail({
        from: this.smtp.FROM,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
      });

      await this.salvarLog(logFile, {
        data: new Date().toLocaleDateString('pt-BR'),
        hora: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        status: 'SENT',
        to: input.to,
        subject: input.subject,
        text: input.text,
      });
    } catch (error: any) {
      await this.salvarLog(logFile, {
        data: new Date().toLocaleDateString('pt-BR'),
        hora: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        status: 'ERROR',
        to: input.to,
        subject: input.subject,
        error: error?.message ?? 'Erro desconhecido',
      });
      AppError.ServerErro({
        message: error,
        messageType: 'alerta',
        telegram: true,
      });
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
      // se não existir ou estiver inválido, começa vazio
      arr = [];
    }

    arr.push(item);

    await fs.writeFile(filePath, JSON.stringify(arr, null, 2), 'utf8');
  }
}
