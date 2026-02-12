import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { TelegramService } from 'src/apiAdm/telegram/telegram.service';
import { TELEGRAM_IDS_MONITORAMENTO_SERVIDOR } from '../../apiAdm/telegram/constants/Telegram.constants';
import { mensagemErroServidor } from 'src/apiAdm/telegram/templates/mensagens.ts';

@Catch(HttpException)
export class MyExceptionFilter<
  T extends HttpException,
> implements ExceptionFilter {
  constructor(private readonly telegramService: TelegramService) {}

  async catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    const statusCode = exception.getStatus();
    const exceptionRes = exception.getResponse();

    function writeLogErro(log: any) {
      const logsDir = path.join(process.cwd(), 'error');

      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      const fileName = `${new Date().toISOString().slice(0, 10)}.json`;
      const filePath = path.join(logsDir, fileName);

      const entry = JSON.stringify(log, null, 2);

      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, `[\n${entry}]`);
        return;
      }

      const stats = fs.statSync(filePath);
      fs.truncateSync(filePath, stats.size - 1);

      const content = fs.readFileSync(filePath, 'utf-8');
      const hasItems = content.trim().length > 1;

      const prefix = hasItems ? ',\n' : '\n';

      fs.appendFileSync(filePath, `${prefix}${entry}\n]`);
    }

    if (exceptionRes['messageType'] === 'alerta') {
      const dados = {
        data: new Date().toLocaleDateString('pt-BR'),
        hora: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        host: req.host,
        path: req.url,
        statusCode: exceptionRes['code'] ?? statusCode,
        error: exceptionRes['error'] ?? null,
        message: exceptionRes['message'] ?? null,
        apresentacao: exceptionRes['messageType'],
        telegram: exceptionRes['telegram'],
      };
      if (exceptionRes['telegram']) {
        const alertaMsg = `
          ${mensagemErroServidor}
          📅 Data: ${new Date().toLocaleDateString('pt-BR')}
          🕒 Hora: ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false })}

          🌐 Host: ${req.host}
          📍 Rota: ${req.url}
          📦 Status: ${exceptionRes['code'] ?? statusCode}

          🛑 Erro: ${exceptionRes['error'] ?? 'N/A'}
          💬 Mensagem: ${exceptionRes['message'] ?? 'N/A'}

          `;

          const title = 'Erro critico no Servidor'

        await this.telegramService.sendToMany(
          alertaMsg,
          TELEGRAM_IDS_MONITORAMENTO_SERVIDOR,
          'alert',
          title,
        );
      }
      writeLogErro(dados);
      console.log('gravarjson');
    }

    return res.status(statusCode).json({
      data: new Date().toLocaleDateString('pt-BR'),
      host: req.host,
      path: req.url,
      statusCode: exceptionRes['code'] ?? statusCode,
      error: exceptionRes['error'] ?? null,
      message: exceptionRes['message'] ?? null,
      apresentacao: exceptionRes['messageType'],
    });
  }
}
