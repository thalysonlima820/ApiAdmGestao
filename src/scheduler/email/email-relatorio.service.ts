import { Injectable } from '@nestjs/common';
import { OracleService } from 'src/common/database/oracle.service';
import * as fs from 'fs';
import * as path from 'path';
import { EmailService } from 'src/apiAdm/email/email.service';

function carregarTemplate(templateFile: string, vars?: Record<string, any>) {
  const filePath = path.join(
    process.cwd(),
    'src',
    'scheduler',
    'email',
    'templates',
    templateFile,
  );

  let html = fs.readFileSync(filePath, 'utf-8');

  if (vars) {
    for (const [key, value] of Object.entries(vars)) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
  }

  return html;
}
function gerarTabelaVendas(vendas: any[]) {
  const moeda = (n: number) =>
    Number(n || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

  const num = (n: number) => Number(n || 0).toLocaleString('pt-BR');

  const pct = (n: number) =>
    `${Number(n || 0)
      .toFixed(2)
      .replace('.', ',')}%`;

  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

  const linhas = (vendas ?? [])
    .map((v, i) => {
      const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc';

      const percMeta = Number(v.PERCENTUAL_CARREGADO || 0);
      const width = clamp(percMeta, 0, 100);

      const barColor =
        percMeta >= 100
          ? '#16a34a'
          : percMeta >= 70
            ? '#2563eb'
            : percMeta >= 50
              ? '#f59e0b'
              : '#ef4444';

      const barraMeta = `
        <div style="width:120px;margin:0 auto;">
          <div style="height:10px;background:#e5e7eb;border-radius:999px;overflow:hidden;">
            <div style="height:10px;width:${width}%;background:${barColor};"></div>
          </div>
          <div style="margin-top:4px;font-size:12px;color:#334155;text-align:center;">
            ${pct(percMeta)}
          </div>
        </div>
      `;

      return `
        <tr style="background:${bg};">
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:700;color:#0f172a;">
            ${v.CODFILIAL}
          </td>

          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;white-space:nowrap;color:#334155;">
            ${moeda(v.CMV)}
          </td>

          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;white-space:nowrap;font-weight:700;color:#0f172a;">
            ${moeda(v.VENDA)}
          </td>

          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;color:#334155;">
            ${num(v.QTNFS)}
          </td>

          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;white-space:nowrap;font-weight:700;color:#14532d;">
            ${moeda(v.LUCRO)}
          </td>

          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;white-space:nowrap;color:#334155;">
            ${moeda(v.TICKET_MEDIO)}
          </td>

          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;color:#334155;">
            ${pct(v.MARGEM)}
          </td>

          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;white-space:nowrap;color:#334155;">
            ${moeda(v.META)}
          </td>

          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;">
            ${barraMeta}
          </td>

          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;color:#334155;">
            ${pct(v.PERC_DA_VENDA)}
          </td>
        </tr>
      `;
    })
    .join('');

  return `
<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  style="
    border-collapse:separate;
    border-spacing:0;
    width:100%;
    font-family:Arial,Helvetica,sans-serif;
    font-size:13px;
    border:1px solid #e2e8f0;
    border-radius:12px;
    overflow:hidden;
  "
>
  <thead>
    <tr>
      <th style="padding:12px 10px;background:#1e40af;color:#fff;border-bottom:1px solid #1e3a8a;text-align:center;">Filial</th>
      <th style="padding:12px 10px;background:#1e40af;color:#fff;border-bottom:1px solid #1e3a8a;text-align:right;">CMV</th>
      <th style="padding:12px 10px;background:#1e40af;color:#fff;border-bottom:1px solid #1e3a8a;text-align:right;">Venda</th>
      <th style="padding:12px 10px;background:#1e40af;color:#fff;border-bottom:1px solid #1e3a8a;text-align:right;">Qt. NFs</th>
      <th style="padding:12px 10px;background:#1e40af;color:#fff;border-bottom:1px solid #1e3a8a;text-align:right;">Lucro</th>
      <th style="padding:12px 10px;background:#1e40af;color:#fff;border-bottom:1px solid #1e3a8a;text-align:right;">Ticket</th>
      <th style="padding:12px 10px;background:#1e40af;color:#fff;border-bottom:1px solid #1e3a8a;text-align:right;">Margem</th>
      <th style="padding:12px 10px;background:#1e40af;color:#fff;border-bottom:1px solid #1e3a8a;text-align:right;">Meta</th>
      <th style="padding:12px 10px;background:#1e40af;color:#fff;border-bottom:1px solid #1e3a8a;text-align:center;">Perc Meta</th>
      <th style="padding:12px 10px;background:#1e40af;color:#fff;border-bottom:1px solid #1e3a8a;text-align:right;">Perc Venda</th>
    </tr>
  </thead>

  <tbody>
    ${linhas}
  </tbody>
</table>
  `.trim();
}
function gerarResumoTotal(vendas: any[]) {
  const moeda = (n: number) =>
    Number(n || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

  const num = (n: number) => Number(n || 0).toLocaleString('pt-BR');

  const pct = (n: number) =>
    `${Number(n || 0)
      .toFixed(2)
      .replace('.', ',')}%`;

  const total = (vendas ?? []).reduce(
    (acc, v) => {
      acc.CMV += Number(v.CMV || 0);
      acc.VENDA += Number(v.VENDA || 0);
      acc.QTNFS += Number(v.QTNFS || 0);
      acc.LUCRO += Number(v.LUCRO || 0);
      acc.META += Number(v.META || 0);
      return acc;
    },
    { CMV: 0, VENDA: 0, QTNFS: 0, LUCRO: 0, META: 0 },
  );

  const ticketGeral = total.QTNFS ? total.VENDA / total.QTNFS : 0;
  const margemGeral = total.VENDA ? (total.LUCRO * 100) / total.VENDA : 0;
  const percMetaGeral = total.META ? (total.VENDA * 100) / total.META : 0;

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));
  const width = clamp(percMetaGeral, 0, 100);

  const barColor =
    percMetaGeral >= 100
      ? '#16a34a'
      : percMetaGeral >= 70
        ? '#2563eb'
        : percMetaGeral >= 50
          ? '#f59e0b'
          : '#ef4444';

  const status =
    percMetaGeral >= 100
      ? {
          text: 'Meta batida',
          bg: '#dcfce7',
          color: '#166534',
          border: '#86efac',
        }
      : percMetaGeral >= 70
        ? {
            text: 'Bom ritmo',
            bg: '#dbeafe',
            color: '#1e40af',
            border: '#93c5fd',
          }
        : percMetaGeral >= 50
          ? {
              text: 'Atenção',
              bg: '#fef3c7',
              color: '#92400e',
              border: '#fcd34d',
            }
          : {
              text: 'Crítico',
              bg: '#fee2e2',
              color: '#991b1b',
              border: '#fca5a5',
            };

  const card = (titulo: string, valor: string, sub?: string) => `
    <td style="padding:0;">
      <div style="
        border:1px solid #e2e8f0;
        border-radius:12px;
        background:#ffffff;
        padding:12px 14px;
      ">
        <div style="font-size:12px;color:#64748b;margin-bottom:6px;">${titulo}</div>
        <div style="font-size:16px;font-weight:800;color:#0f172a;line-height:1.2;">${valor}</div>
        ${sub ? `<div style="margin-top:6px;font-size:12px;color:#475569;">${sub}</div>` : ''}
      </div>
    </td>
  `;

  return `
<div style="
  margin-top:18px;
  border:1px solid #e2e8f0;
  border-radius:14px;
  background:#f8fafc;
  overflow:hidden;
">
  <!-- header -->
  <div style="
    padding:14px 16px;
    background:linear-gradient(90deg,#1e40af,#2563eb);
    color:#fff;
  ">
    <div style="font-size:14px;font-weight:800;">
      📌 Total geral (todas as filiais)
      <span style="
        display:inline-block;
        margin-left:8px;
        padding:3px 8px;
        border-radius:999px;
        background:${status.bg};
        color:${status.color};
        border:1px solid ${status.border};
        font-weight:800;
        font-size:11px;
        vertical-align:middle;
      ">${status.text}</span>
    </div>
    <div style="margin-top:4px;font-size:12px;opacity:.95;">
      Consolidado • Venda x CMV • Meta e performance
    </div>
  </div>

  <div style="padding:14px 16px;">
    <!-- cards (tabela p/ compatibilidade em email) -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:10px 10px;">
      <tr>
        ${card('Venda total', moeda(total.VENDA), `<b>CMV:</b> ${moeda(total.CMV)}`)}
        ${card('Lucro total', moeda(total.LUCRO), `<b>Margem:</b> ${pct(margemGeral)}`)}
      </tr>
      <tr>
        ${card('NFs', num(total.QTNFS), '')}
        ${card('Ticket médio', moeda(ticketGeral), '')}
      </tr>
    </table>

    <!-- meta -->
    <div style="
      margin-top:8px;
      border:1px solid #e2e8f0;
      border-radius:12px;
      background:#ffffff;
      padding:12px 14px;
    ">
      <div style="display:block;margin-bottom:8px;">
        <div style="font-size:12px;color:#64748b;">Meta total</div>
        <div style="font-size:14px;font-weight:800;color:#0f172a;">
          ${moeda(total.META)}
          <span style="color:#64748b;font-weight:600;"> • % carregado: ${pct(percMetaGeral)}</span>
        </div>
      </div>

      <div style="height:10px;background:#e5e7eb;border-radius:999px;overflow:hidden;">
        <div style="height:10px;width:${width}%;background:${barColor};"></div>
      </div>

      <div style="margin-top:8px;font-size:12px;color:#475569;">
        <b>Progresso:</b> ${pct(percMetaGeral)} • <b>Falta:</b> ${moeda(Math.max(0, total.META - total.VENDA))}
      </div>
    </div>
  </div>
</div>
  `.trim();
}
function gerarProdutividade(vendas: any[]) {
  const moeda = (n: number) =>
    Number(n || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

  const num = (n: number) => Number(n || 0).toLocaleString('pt-BR');

  const safeDiv = (a: number, b: number) => (b > 0 ? a / b : 0);

  // totais (média ponderada correta)
  const total = (vendas ?? []).reduce(
    (acc, v) => {
      acc.VENDA += Number(v.VENDA || 0);
      acc.QT_FUNCIONARIO += Number(v.QT_FUNCIONARIO || 0);
      acc.METRO += Number(v.METRO || 0);
      acc.CHECKOUTS += Number(v.CHECKOUTS || 0);
      return acc;
    },
    { VENDA: 0, QT_FUNCIONARIO: 0, METRO: 0, CHECKOUTS: 0 },
  );

  const vendaPorFuncTotal = safeDiv(total.VENDA, total.QT_FUNCIONARIO);
  const vendaPorMetroTotal = safeDiv(total.VENDA, total.METRO);
  const vendaPorCheckTotal = safeDiv(total.VENDA, total.CHECKOUTS);

  const linhas = (vendas ?? [])
    .map((v, i) => {
      const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc';

      const venda = Number(v.VENDA || 0);
      const qtdFunc = Number(v.QT_FUNCIONARIO || 0);
      const metro = Number(v.METRO || 0);
      const CHECKOUTS = Number(v.CHECKOUTS || 0);

      const vPorFunc = safeDiv(venda, qtdFunc);
      const vPorMetro = safeDiv(venda, metro);
      const vPorCheck = safeDiv(venda, CHECKOUTS);

      return `
        <tr style="background:${bg};">
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:800;color:#0f172a;">
            ${v.CODFILIAL}
          </td>

          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;color:#334155;">
            ${num(qtdFunc)}
          </td>

          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;color:#334155;">
            ${num(metro)}
          </td>

          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;color:#334155;">
            ${num(CHECKOUTS)}
          </td>

          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;white-space:nowrap;font-weight:800;color:#0f172a;">
            ${moeda(vPorFunc)}
          </td>

          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;white-space:nowrap;font-weight:800;color:#0f172a;">
            ${moeda(vPorMetro)}
          </td>

          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;white-space:nowrap;font-weight:800;color:#0f172a;">
            ${moeda(vPorCheck)}
          </td>
        </tr>
      `;
    })
    .join('');

  const card = (titulo: string, valor: string, sub?: string) => `
    <td style="padding:0;">
      <div style="
        border:1px solid #e2e8f0;
        border-radius:12px;
        background:#ffffff;
        padding:12px 14px;
      ">
        <div style="font-size:12px;color:#64748b;margin-bottom:6px;">${titulo}</div>
        <div style="font-size:16px;font-weight:900;color:#0f172a;line-height:1.2;">${valor}</div>
        ${sub ? `<div style="margin-top:6px;font-size:12px;color:#475569;">${sub}</div>` : ''}
      </div>
    </td>
  `;

  return `
<div style="margin-top:18px;border:1px solid #e2e8f0;border-radius:14px;background:#f8fafc;overflow:hidden;">
  <div style="padding:14px 16px;background:linear-gradient(90deg,#0f172a,#334155);color:#fff;">
    <div style="font-size:14px;font-weight:900;">⚙️ Produtividade (Funcionário • m² • Check-outs)</div>
    <div style="margin-top:4px;font-size:12px;opacity:.95;">Consolidado e detalhado por filial</div>
  </div>

  <div style="padding:14px 16px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:10px 10px;">
      <tr>
        ${card('Venda / Funcionário (Total)', moeda(vendaPorFuncTotal), `<b>Funcionários:</b> ${num(total.QT_FUNCIONARIO)}`)}
        ${card('Venda / m² (Total)', moeda(vendaPorMetroTotal), `<b>m²:</b> ${num(total.METRO)}`)}
      </tr>
      <tr>
        ${card('Venda / Check-out (Total)', moeda(vendaPorCheckTotal), `<b>Check-outs:</b> ${num(total.CHECKOUTS)}`)}
        ${card('Venda Total', moeda(total.VENDA), '')}
      </tr>
    </table>

    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="
        margin-top:6px;
        border-collapse:separate;
        border-spacing:0;
        width:100%;
        font-family:Arial,Helvetica,sans-serif;
        font-size:13px;
        border:1px solid #e2e8f0;
        border-radius:12px;
        overflow:hidden;
        background:#fff;
      "
    >
      <thead>
        <tr>
          <th style="padding:12px 10px;background:#0f172a;color:#fff;border-bottom:1px solid #0b1220;text-align:center;">Filial</th>
          <th style="padding:12px 10px;background:#0f172a;color:#fff;border-bottom:1px solid #0b1220;text-align:right;">Funcionários</th>
          <th style="padding:12px 10px;background:#0f172a;color:#fff;border-bottom:1px solid #0b1220;text-align:right;">m²</th>
          <th style="padding:12px 10px;background:#0f172a;color:#fff;border-bottom:1px solid #0b1220;text-align:right;">Check-outs</th>
          <th style="padding:12px 10px;background:#0f172a;color:#fff;border-bottom:1px solid #0b1220;text-align:right;">Venda / Funcionário</th>
          <th style="padding:12px 10px;background:#0f172a;color:#fff;border-bottom:1px solid #0b1220;text-align:right;">Venda / m²</th>
          <th style="padding:12px 10px;background:#0f172a;color:#fff;border-bottom:1px solid #0b1220;text-align:right;">Venda / Check-out</th>
        </tr>
      </thead>

      <tbody>
        ${linhas}
      </tbody>
    </table>
  </div>
</div>
  `.trim();
}
function gerarTabelaBalancete(itens: any[]) {
  const moeda = (n: number) =>
    Number(n || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

  const pct = (n: number) =>
    `${Number(n || 0)
      .toFixed(2)
      .replace('.', ',')}%`;

  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

  const badge = (p: number) => {
    const perc = Number(p || 0);
    const width = clamp(perc, 0, 100);

    const barColor =
      perc >= 100
        ? '#16a34a'
        : perc >= 70
          ? '#2563eb'
          : perc >= 50
            ? '#f59e0b'
            : '#ef4444';

    return `
      <div style="width:120px;margin:0 auto;">
        <div style="height:10px;background:#e5e7eb;border-radius:999px;overflow:hidden;">
          <div style="height:10px;width:${width}%;background:${barColor};"></div>
        </div>
        <div style="margin-top:4px;font-size:12px;color:#334155;text-align:center;">
          ${pct(perc)}
        </div>
      </div>
    `;
  };

  const linhas = (itens ?? [])
    .map((b, i) => {
      const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc';

      const saldo = Number(b.SALDO || 0);
      const saldoColor = saldo < 0 ? '#991b1b' : '#14532d';

      return `
        <tr style="background:${bg};">
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:800;color:#0f172a;">
            ${b.GRUPOCONTA}
          </td>

          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:left;color:#0f172a;font-weight:700;">
            ${String(b.GRUPO || '')}
          </td>

          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;white-space:nowrap;color:#334155;">
            ${moeda(b.VLPREVISTO)}
          </td>

          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;white-space:nowrap;font-weight:800;color:#0f172a;">
            ${moeda(b.VLREALIZADO)}
          </td>

          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;">
            ${badge(Number(b.PORCENTAGEM || 0))}
          </td>

          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;white-space:nowrap;color:#334155;">
            ${moeda(b.ORCAMENTO)}
          </td>

          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;white-space:nowrap;font-weight:900;color:${saldoColor};">
            ${moeda(b.SALDO)}
          </td>
        </tr>
      `;
    })
    .join('');

  const meta = itens?.[0]?.META ?? 0;

  return `
<div style="margin-top:18px;">
  <div style="
    padding:14px 16px;
    border:1px solid #e2e8f0;
    border-bottom:none;
    border-radius:14px 14px 0 0;
    background:linear-gradient(90deg,#1e40af,#2563eb);
    color:#fff;
  ">
    <div style="font-size:14px;font-weight:900;">📒 Balancete</div>
    <div style="margin-top:4px;font-size:12px;opacity:.95;">
      Meta (referência): <b>${moeda(meta)}</b>
    </div>
  </div>

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="
      border-collapse:separate;
      border-spacing:0;
      width:100%;
      font-family:Arial,Helvetica,sans-serif;
      font-size:13px;
      border:1px solid #e2e8f0;
      border-radius:0 0 14px 14px;
      overflow:hidden;
      background:#fff;
    "
  >
    <thead>
      <tr>
        <th style="padding:12px 10px;background:#1e40af;color:#fff;border-bottom:1px solid #1e3a8a;text-align:center;">Grupo</th>
        <th style="padding:12px 10px;background:#1e40af;color:#fff;border-bottom:1px solid #1e3a8a;text-align:left;">Descrição</th>
        <th style="padding:12px 10px;background:#1e40af;color:#fff;border-bottom:1px solid #1e3a8a;text-align:right;">Vl Previsto</th>
        <th style="padding:12px 10px;background:#1e40af;color:#fff;border-bottom:1px solid #1e3a8a;text-align:right;">Vl Realizado</th>
        <th style="padding:12px 10px;background:#1e40af;color:#fff;border-bottom:1px solid #1e3a8a;text-align:center;">%</th>
        <th style="padding:12px 10px;background:#1e40af;color:#fff;border-bottom:1px solid #1e3a8a;text-align:right;">Orçamento</th>
        <th style="padding:12px 10px;background:#1e40af;color:#fff;border-bottom:1px solid #1e3a8a;text-align:right;">Saldo</th>
      </tr>
    </thead>

    <tbody>
      ${linhas}
    </tbody>
  </table>
</div>
  `.trim();
}

function carregarSql(sqlFile: string) {
  const filePath = path.join(process.cwd(), 'src', 'scheduler', 'email', 'sql', sqlFile);
  return fs.readFileSync(filePath, 'utf-8');
}

@Injectable()
export class EmailRelatorioService {
  constructor(
    private readonly emailService: EmailService,
    private readonly oracle: OracleService,
  ) {}

  async enviarRelatorioGerencial() {
    const sqlVenda = carregarSql('venda.sql');
    const sqlBalancete = carregarSql('balancete.sql');

    const venda = await this.oracle.query<any>(sqlVenda);
    const balancete = await this.oracle.query<any>(sqlBalancete);

    const to = process.env.EMAIL_VENDA_BALANCETE
      ?.split(',')
      .map(e => e.trim())
      .filter(Boolean) ?? []

    const hoje = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const subject = `📊 Relatório Gerencial ADM Gestão • ${hoje}`;

    const tabelaHtml = gerarTabelaVendas(venda);
    const resumo = gerarResumoTotal(venda);
    const produtividade = gerarProdutividade(venda);
    const tabelaBalancete = gerarTabelaBalancete(balancete);

    const html = carregarTemplate('RelatorioAdm.html', {
      nome: 'Thalyson',
      tabela: tabelaHtml,
      resumo,
      produtividade,
      balancete: tabelaBalancete,
    });

    const text = 'Email Relatório Gerencial enviado com Sucesso';

    await this.emailService.sendEmail(to, subject, html, text);

    return { texto: text };
  }
  
}
