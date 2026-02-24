import {
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EntradaSaidaService } from './entrada-saida.service';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { RoutePolicyGuard } from 'src/auth/guards/route-policy.guard';
import { SetRoutePolicy } from 'src/auth/decorators/set_route_policy.decorator';
import { RoutePolicy } from 'src/auth/enum/route-policy.enum';
import { ChangeDataInterceptor } from 'src/common/interceptors/change-data.interceptor';
import { EncryptResponseInterceptor } from 'src/common/interceptors/encrypt-response.interceptor';

@Controller('entradasaida')
export class EntradaSaidaController {
  constructor(private readonly entradaSaidaService: EntradaSaidaService) {}

  @Get(':datainicio/:datafim/:trans/:filial')
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @SetRoutePolicy(RoutePolicy.getEntradaSaida)
  @UseInterceptors(ChangeDataInterceptor)
  @UseInterceptors(EncryptResponseInterceptor)
  GetEntradaSaidaDep(
    @Param('datainicio') datainicio: string,
    @Param('datafim') datafim: string,
    @Param('trans') trans: string,
    @Param('filial') filial: string,
  ) {
    return this.entradaSaidaService.GetEntradaSaidaDep(
      datainicio,
      datafim,
      trans,
      filial,
    );
  }

  @Get(':datainicio/:datafim/:trans/:filial/:codepto')
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @SetRoutePolicy(RoutePolicy.getEntradaSaida)
  @UseInterceptors(ChangeDataInterceptor)
  @UseInterceptors(EncryptResponseInterceptor)
  GetEntradaSaidaSec(
    @Param('datainicio') datainicio: string,
    @Param('datafim') datafim: string,
    @Param('trans') trans: string,
    @Param('filial') filial: string,
    @Param('codepto') codepto: number,
  ) {
    return this.entradaSaidaService.GetEntradaSaidaSec(
      datainicio,
      datafim,
      trans,
      filial,
      codepto,
    );
  }

  @Get(':datainicio/:datafim/:trans/:filial/:codepto/:codsec')
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @SetRoutePolicy(RoutePolicy.getEntradaSaida)
  @UseInterceptors(ChangeDataInterceptor)
  @UseInterceptors(EncryptResponseInterceptor)
  GetEntradaSaidaCate(
    @Param('datainicio') datainicio: string,
    @Param('datafim') datafim: string,
    @Param('trans') trans: string,
    @Param('filial') filial: string,
    @Param('codepto') codepto: number,
    @Param('codsec') codsec: number,
  ) {
    return this.entradaSaidaService.GetEntradaSaidaCate(
      datainicio,
      datafim,
      trans,
      filial,
      codepto,
      codsec,
    );
  }

  @Get(':datainicio/:datafim/:trans/:filial/:codepto/:codsec/:codcategoria')
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @SetRoutePolicy(RoutePolicy.getEntradaSaida)
  @UseInterceptors(ChangeDataInterceptor)
  @UseInterceptors(EncryptResponseInterceptor)
  GetEntradaSaidaProd(
    @Param('datainicio') datainicio: string,
    @Param('datafim') datafim: string,
    @Param('trans') trans: string,
    @Param('filial') filial: string,
    @Param('codepto') codepto: number,
    @Param('codsec') codsec: number,
    @Param('codcategoria') codcategoria: number,
  ) {
    return this.entradaSaidaService.GetEntradaSaidaProd(
      datainicio,
      datafim,
      trans,
      filial,
      codepto,
      codsec,
      codcategoria,
    );
  }
}
