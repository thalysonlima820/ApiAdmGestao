import { MAXIMO_DE_LATENCIA } from "src/common/middleware/constants/serve-name.constant";

export const mensagemTeste =
  '🧪 Esta é uma mensagem de teste gerada pelo novo servidor NestJS.';

export const mensagemServidorOn =
  '✅ Servidor NestJS iniciado com sucesso e operando normalmente.';

export const mensagemErroServidor =
  '🚨 Erro detectado no servidor NestJS.';

export const mensagemLatenciaServidor =
  `⏱️ ALERTA DE LATÊNCIA: O servidor NestJS ultrapassou o limite esperado de ${MAXIMO_DE_LATENCIA}s.`;
