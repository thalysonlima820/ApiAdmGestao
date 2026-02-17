import { Controller, Get, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { PrecificacaoService } from './precificacao.service';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { RoutePolicyGuard } from 'src/auth/guards/route-policy.guard';
import { SetRoutePolicy } from 'src/auth/decorators/set_route_policy.decorator';
import { RoutePolicy } from 'src/auth/enum/route-policy.enum';
import { ChangeDataInterceptor } from 'src/common/interceptors/change-data.interceptor';
import { EncryptResponseInterceptor } from 'src/common/interceptors/encrypt-response.interceptor';

@Controller('precificacao')
export class PrecificacaoController {
  constructor(private readonly precificacaoService: PrecificacaoService) {}

  @Get(':data_entrada')
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @SetRoutePolicy(RoutePolicy.getPrecificacao)
  @UseInterceptors(ChangeDataInterceptor)
  @UseInterceptors(EncryptResponseInterceptor)
  GetAjuste(@Param('data_entrada') data_entrada: string) {
    return this.precificacaoService.GetAjuste(data_entrada);
  }

}
