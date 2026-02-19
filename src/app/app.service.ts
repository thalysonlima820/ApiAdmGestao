import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { TelegramService } from 'src/apiAdm/telegram/telegram.service';
import { mensagemLatenciaServidor } from 'src/apiAdm/telegram/templates/mensagens.ts';
import { TELEGRAM_IDS_MONITORAMENTO_SERVIDOR } from 'src/apiAdm/telegram/constants/Telegram.constants';
import { MAXIMO_DE_LATENCIA } from 'src/common/middleware/constants/serve-name.constant';

@Injectable()
export class AppService {
  constructor(private readonly telegramService: TelegramService) {}

  private ultimoAlertaLatenciaDia: string | null = null;

  getHello(): string {
    return 'Hello World!';
  }

  private hojeBR(): string {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = String(now.getFullYear());
    return `${dd}/${mm}/${yyyy}`;
  }

  private isHojeBR(dateStr: string): boolean {
    return dateStr === this.hojeBR();
  }

  private podeEnviarAlertaHoje(): boolean {
    const hoje = this.hojeBR();
    if (this.ultimoAlertaLatenciaDia === hoje) return false;
    this.ultimoAlertaLatenciaDia = hoje;
    return true;
  }

  async getLog() {
    const dados = this.readAllLogs();

    let alertaMsg: string | null = null;

    const resumo = dados.reduce(
      (acc, d) => {
        if (!this.isHojeBR(String(d.date || ''))) return acc;

        const host = d.host || 'desconhecido';
        const method = d.method || 'UNKNOWN';
        const route = d.url || d.route || 'UNKNOWN';
        const duration = Number(d.duration) || 0;

        acc[host] ??= {};
        acc[host][method] ??= {
          total: 0,
          somaTm: 0,
          mediaTm: 0,
          minTm: null as number | null,
          maxTm: null as number | null,
        };

        const g = acc[host][method];

        g.total += 1;
        g.somaTm = Number((g.somaTm + duration).toFixed(6));
        g.mediaTm = Number((g.somaTm / g.total).toFixed(2));
        g.minTm = g.minTm === null ? duration : Math.min(g.minTm, duration);
        g.maxTm = g.maxTm === null ? duration : Math.max(g.maxTm, duration);

        if (duration >= g.maxTm && duration > MAXIMO_DE_LATENCIA) {
          if (!alertaMsg && this.podeEnviarAlertaHoje()) {
            alertaMsg = `
            ${mensagemLatenciaServidor}

            🌐 Host: ${host}
            🧭 Método: ${method}
            📍 Rota: ${route}

            ⏳ Tempo de Resposta: ${duration}s

            ⚠️ Verifique possível gargalo, consulta lenta ou sobrecarga no servidor.
            `.trim();
          }
        }

        return acc;
      },
      {} as Record<
        string,
        Record<
          string,
          {
            total: number;
            somaTm: number;
            mediaTm: number;
            minTm: number | null;
            maxTm: number | null;
          }
        >
      >,
    );

    if (alertaMsg) {
      const title = 'Alerta Latencia';
      await this.telegramService.sendToMany(
        alertaMsg,
        TELEGRAM_IDS_MONITORAMENTO_SERVIDOR,
        'alert',
        title,
      );
    }
    return { resumo, logs: dados };
  }

  private readAllLogs() {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) return [];

    const files = fs.readdirSync(logsDir).filter((f) => f.endsWith('.json'));
    const allLogs: any[] = [];

    for (const file of files) {
      const filePath = path.join(logsDir, file);

      try {
        const content = fs.readFileSync(filePath, 'utf-8').trim();
        if (!content) continue;

        const parsed = JSON.parse(content);
        if (!Array.isArray(parsed)) continue;

        allLogs.push(
          ...parsed.map((l) => ({
            date: l.date,
            host: l.host,
            url: l.url,
            route: l.url,
            method: l.method,
            duration: l.duration,
            codusuario: l.codusuario,
            ip: l.ip,
          })),
        );
      } catch (erro) {
        console.log('Erro ao ler log:', file, erro);
      }
    }

    return allLogs;
  }

  async getLogUser() {
    const dados = this.readAllLogs();
    const hoje = this.hojeBR();

    const logsUsuarioHoje = dados
      .filter((l) => {
        const date = String(l?.date ?? '');
        if (date !== hoje) return false;
        const url = String(l?.url ?? l?.route ?? '')
          .trim()
          .toLowerCase();
        const isUsuario = url.startsWith('/adm/usuario');
        const isLogUsuario = url.startsWith('/log/usuario');
        return isUsuario && !isLogUsuario;
      })
      .sort((a, b) =>
        String(a?.hora ?? '').localeCompare(String(b?.hora ?? '')),
      );

    return { dados: logsUsuarioHoje };
  }

  private readAllLogsTelegram() {
    const logsDir = path.join(process.cwd(), 'logs', 'telegram');
    if (!fs.existsSync(logsDir)) return [];

    const files = fs.readdirSync(logsDir).filter((f) => f.endsWith('.json'));
    const allLogs: any[] = [];

    for (const file of files) {
      const filePath = path.join(logsDir, file);

      try {
        const content = fs.readFileSync(filePath, 'utf-8').trim();
        if (!content) continue;

        const parsed = JSON.parse(content);
        if (!Array.isArray(parsed)) continue;

        allLogs.push(
          ...parsed.map((l) => ({
            data: l.data,
            hora: l.hora,
            status: l.status,
            botType: l.botType, // ✅ corrigido
            chatId: l.chatId,
            title: l.title, // ✅ corrigido
          })),
        );
      } catch (erro) {
        console.log('Erro ao ler log:', file, erro);
      }
    }

    return allLogs;
  }

  async getLogTelegram() {
    const dados = this.readAllLogsTelegram();
    const hoje = this.hojeBR();

    const logsHoje = dados
      .filter((l) => String(l?.data ?? '') === hoje) // ✅ corrigido
      .sort((a, b) =>
        String(a?.hora ?? '').localeCompare(String(b?.hora ?? '')),
      );

    return { dados: logsHoje };
  }

  async getLogPrecificacao() {
    const dados = this.readAllLogs();
    const hoje = this.hojeBR();

    const logsUsuarioHoje = dados
      .filter((l) => {
        const date = String(l?.date ?? '');
        if (date !== hoje) return false;
        const url = String(l?.url ?? l?.route ?? '')
          .trim()
          .toLowerCase();
        const isUsuario = url.startsWith('/adm/precificacao');
        const isLogUsuario = url.startsWith('/log/precificacao');
        return isUsuario && !isLogUsuario;
      })
      .sort((a, b) =>
        String(a?.hora ?? '').localeCompare(String(b?.hora ?? '')),
      );

    return { dados: logsUsuarioHoje };
  }
}
