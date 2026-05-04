import { Injectable } from '@nestjs/common';
import { TelegramService } from 'src/apiAdm/telegram/telegram.service';
import { OracleService } from 'src/common/database/oracle.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TelegramScheduleService {
  constructor(
    private readonly telegramService: TelegramService,
    private readonly oracle: OracleService,
  ) {}

  private formatToBRL(value: number): string {
    return Number(value || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private processarVendas(vendas: any[], titulo: string): string {
    let totalNumeroVendas = 0;
    let totalCusto = 0;
    let totalVenda = 0;
    let totalMeta = 0;

    const apresentacao: string[] = [`🧾 ${titulo}\n`];

    for (const venda of vendas) {
      const filial = venda.CODFILIAL;
      const numVendas = Number(venda.NUMVENDAS) || 0;
      const vendaTotal = Number(venda.VENDA) || 0;
      const custo = Number(venda.CUSTO) || 0;
      const ticketMedio = Number(venda.TICKET_MEDIO) || 0;
      const margem = Number(venda.MARGEM) || 0;
      const meta = Number(venda.META) || 0;
      const metaPorcentagem = Number(venda.PERCENTUAL_CARREGADO) || 0;

      totalNumeroVendas += numVendas;
      totalCusto += custo;
      totalVenda += vendaTotal;
      totalMeta += meta;

      const status = metaPorcentagem >= 100 ? '🟢' : '🔴';

      apresentacao.push(
        `${status} Filial ${filial}`,
        `  - 🛒 Venda: ${this.formatToBRL(vendaTotal)}`,
        `  - 💰 Ticket Médio: ${this.formatToBRL(ticketMedio)}`,
        `  - 🧾 N° Venda: ${numVendas.toLocaleString('pt-BR')}`,
        `  - 📊 Margem: ${margem.toFixed(2)}%`,
        `  - 🎯 Meta: ${metaPorcentagem.toFixed(2)}%\n`,
      );
    }

    const margemTotal =
      totalVenda > 0
        ? (((totalVenda - totalCusto) * 100) / totalVenda).toFixed(2)
        : '0.00';

    const ticketMedioTotal =
      totalNumeroVendas > 0
        ? (totalVenda / totalNumeroVendas).toFixed(2)
        : '0.00';

    const metaPorcentagemTotal =
      totalMeta > 0 ? ((totalVenda / totalMeta) * 100).toFixed(2) : '0.00';

    apresentacao.push(
      '━━━━━━━━━━━━━━━',
      `📊 Total Geral`,
      `  - 🛒 Venda: ${this.formatToBRL(totalVenda)}`,
      `  - 💰 Ticket Médio: ${this.formatToBRL(Number(ticketMedioTotal))}`,
      `  - 📊 Margem: ${margemTotal}%`,
      `  - 🧾 N° Venda: ${totalNumeroVendas.toLocaleString('pt-BR')}`,
      `  - 🎯 Meta: ${metaPorcentagemTotal}%`,
    );

    return apresentacao.join('\n');
  }

  async enviarTelegramTeste() {
    const sqlPath = path.join(
      process.cwd(),
      'src',
      'scheduler',
      'telegram',
      'SQL',
      'venda.sql',
    );

    const sql = fs.readFileSync(sqlPath, 'utf-8');
    const row = await this.oracle.query(sql);
    const vendas = Array.isArray(row) ? row : []

    const ids = process.env.TELEGRAM_IDS_MONITORAMENTO_SERVIDOR!
    const boot = 'admin';
    const title = 'Relatório de Vendas por Filial Mês Atual';

    const msg = this.processarVendas(vendas, title);
    await this.telegramService.sendToMany(msg, ids, boot, title);
  }

  async enviarTelegramVendaDiaAnterior() {
    const sqlPath = path.join(
      process.cwd(),
      'src',
      'scheduler',
      'telegram',
      'SQL',
      'vendaDiaAnteriro.sql',
    );

    const sql = fs.readFileSync(sqlPath, 'utf-8');
    const row = await this.oracle.query(sql);
    const vendas = Array.isArray(row) ? row : []

    const ids = process.env.TELEGRAM_IDS_MONITORAMENTO_SERVIDOR!
    const boot = 'admin';
    const title = 'Relatório de Vendas por Filial Dia Anterior';

    const msg = this.processarVendas(vendas, title);
    await this.telegramService.sendToMany(msg, ids, boot, title);
  }

  async enviarTelegramVendaDia() {
    const sqlPath = path.join(
      process.cwd(),
      'src',
      'scheduler',
      'telegram',
      'SQL',
      'vendaDia.sql',
    );

    const sql = fs.readFileSync(sqlPath, 'utf-8');
    const row = await this.oracle.query(sql);
    const vendas = Array.isArray(row) ? row : []

    const ids = process.env.TELEGRAM_IDS_MONITORAMENTO_SERVIDOR!
    const boot = 'admin';
    const title = 'Relatório de Vendas por Filial Atual';

    const msg = this.processarVendas(vendas, title);
    await this.telegramService.sendToMany(msg, ids, boot, title);
  }
}
