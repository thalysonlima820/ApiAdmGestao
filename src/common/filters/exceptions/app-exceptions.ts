import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export type MessageType = 'alerta' | 'aviso';

type AppErrorOptions = {
  message: string;
  error?: string;
  messageType: MessageType;
  code?: string;
  telegram?: boolean;
};

function payload(
  message: string,
  error: string,
  messageType: MessageType,
  code?: string,
  telegram?: boolean,
) {
  return {
    message,
    error,
    code: code ?? null,
    messageType,
    telegram: telegram ?? false
  };
}

export const AppError = {
  notFound(options: AppErrorOptions) {
    throw new NotFoundException(
      payload(
        options.message,
        options.error ?? 'Não encontrado',
        options.messageType,
        options.code,
        options.telegram,
      ),
    );
  },

  forbidden(options: AppErrorOptions) {
    throw new ForbiddenException(
      payload(
        options.message,
        options.error ?? 'Sem permissão',
        options.messageType,
        options.code,
        options.telegram,
      ),
    );
  },

  unauthorized(options: AppErrorOptions) {
    throw new UnauthorizedException(
      payload(
        options.message,
        options.error ?? 'Não autenticado',
        options.messageType,
        options.code,
        options.telegram,
      ),
    );
  },

  badRequest(options: AppErrorOptions) {
    throw new BadRequestException(
      payload(
        options.message,
        options.error ?? 'Requisição inválida',
        options.messageType,
        options.code,
        options.telegram,
      ),
    );
  },

  ServerErro(options: AppErrorOptions) {
    throw new InternalServerErrorException(
      payload(
        options.message,
        options.error ?? 'Erro interno no servidor',
        'alerta',
        options.code,
        options.telegram,
      ),
    );
  },
};
