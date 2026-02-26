import { Controller, Get, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { TributacaoService } from './tributacao.service';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { RoutePolicyGuard } from 'src/auth/guards/route-policy.guard';
import { SetRoutePolicy } from 'src/auth/decorators/set_route_policy.decorator';
import { RoutePolicy } from 'src/auth/enum/route-policy.enum';
import { ChangeDataInterceptor } from 'src/common/interceptors/change-data.interceptor';
import { EncryptResponseInterceptor } from 'src/common/interceptors/encrypt-response.interceptor';


@Controller('tributacao')
export class TributacaoController {
  constructor(private readonly tributacaoService: TributacaoService) {}

  @Get('figura/:dataInicio/:datafim/:filial')
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @SetRoutePolicy(RoutePolicy.getTributacao)
  @UseInterceptors(ChangeDataInterceptor, EncryptResponseInterceptor)
  GetFiguraTrib(
    @Param('dataInicio') dataInicio: string,
    @Param('datafim') datafim: string,
    @Param('filial') filial: string,
  ) {
    return this.tributacaoService.GetFiguraTrib(dataInicio, datafim, filial);
  }

  @Get('log/:dataInicio/:datafim')
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @SetRoutePolicy(RoutePolicy.getTributacao)
  @UseInterceptors(ChangeDataInterceptor, EncryptResponseInterceptor)
  GetLogTrib(
    @Param('dataInicio') dataInicio: string,
    @Param('datafim') datafim: string,
  ) {
    return this.tributacaoService.GetLogTrib(dataInicio, datafim);
  }
}