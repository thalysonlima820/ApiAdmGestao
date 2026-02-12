import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { logDto } from './dto/log.dto';

export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    next();

    res.on('finish', () => {
      if (req.originalUrl === '/log' || req.originalUrl === '/email' || req.originalUrl === '/telegram') return;

      const tempoSegundos = Number(((Date.now() - start) / 1000).toFixed(2));

      const log: logDto = {
        date: new Date().toLocaleDateString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
        }),
        hora: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        host: req.headers.host ?? '',
        method: req.method,
        url: req.originalUrl,
        duration: tempoSegundos,
        ip: req.ip,
      };

      this.writeLog(log);
    });
  }

  private writeLog(log: any) {
    const logsDir = path.join(process.cwd(), 'logs');

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
}
