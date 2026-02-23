import { Controller, Get, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { LimiteService } from './limite.service';
import { SetRoutePolicy } from 'src/auth/decorators/set_route_policy.decorator';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { RoutePolicyGuard } from 'src/auth/guards/route-policy.guard';
import { RoutePolicy } from 'src/auth/enum/route-policy.enum';
import { ChangeDataInterceptor } from 'src/common/interceptors/change-data.interceptor';
import { EncryptResponseInterceptor } from 'src/common/interceptors/encrypt-response.interceptor';

@Controller('limite')
export class LimiteController {
  constructor(private readonly limiteService: LimiteService) {}

  @Get(':dataInicio/:dataFim')
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @SetRoutePolicy(RoutePolicy.getLimite)
  @UseInterceptors(ChangeDataInterceptor)
  @UseInterceptors(EncryptResponseInterceptor)
  GetLimite(
    @Param('dataInicio') dataInicio: string,
    @Param('dataFim') dataFim: string,
  ) {
    return this.limiteService.GetLimite(dataInicio, dataFim);
  }
}
