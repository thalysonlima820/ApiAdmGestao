import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUEST_TOKEN_PAYLOAD_KEY, ROUTE_POLICY_KEY } from '../auth.constants';
import { RoutePolicy } from '../enum/route-policy.enum';
import { AppError } from 'src/common/filters/exceptions/app-exceptions';

@Injectable()
export class RoutePolicyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPolicy = this.reflector.get<RoutePolicy | undefined>(
      ROUTE_POLICY_KEY,
      context.getHandler(),
    );

    if (!requiredPolicy) return true;

    const request = context.switchToHttp().getRequest();
    const tokenPayload = request[REQUEST_TOKEN_PAYLOAD_KEY];

    const denyForbidden = () => {
      AppError.forbidden({
        message: `Rota requer permissão: ${requiredPolicy}`,
        messageType: 'alerta',
      });
      return false;
    };

    if (!tokenPayload?.pessoa) {
      AppError.unauthorized({
        message: 'Você precisa estar logado para acessar esta rota',
        messageType: 'aviso',
      });
      return false;
    }

    const { pessoa } = tokenPayload;

    const policies: string[] =
      typeof pessoa.ROUTEPOLICIES === 'string'
        ? pessoa.ROUTEPOLICIES.split(',').map((p) => p.trim()).filter(Boolean)
        : Array.isArray(pessoa.ROUTEPOLICIES)
        ? pessoa.ROUTEPOLICIES
        : [];

    if (!policies.includes(requiredPolicy)) {
      return denyForbidden();
    }

    return true;
  }
}
