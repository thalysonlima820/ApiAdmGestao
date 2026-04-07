import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PrecificacaoService } from './precificacao.service';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { RoutePolicyGuard } from 'src/auth/guards/route-policy.guard';
import { SetRoutePolicy } from 'src/auth/decorators/set_route_policy.decorator';
import { RoutePolicy } from 'src/auth/enum/route-policy.enum';
import { ChangeDataInterceptor } from 'src/common/interceptors/change-data.interceptor';
import { EncryptResponseInterceptor } from 'src/common/interceptors/encrypt-response.interceptor';
import { UpdatePrecoDto } from './dto/update-preco.dto';

@Controller('precificacao')
export class PrecificacaoController {
  constructor(private readonly precificacaoService: PrecificacaoService) {}

  @Get('pesquisa/:codprod')
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @SetRoutePolicy(RoutePolicy.getPrecificacao)
  @UseInterceptors(EncryptResponseInterceptor)
  PesquisaProduto(@Param('codprod') codprod: string) {
    return this.precificacaoService.PesquisaProduto(codprod);
  }

  @Get(':data_entrada')
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @SetRoutePolicy(RoutePolicy.getPrecificacao)
  @UseInterceptors(ChangeDataInterceptor)
  @UseInterceptors(EncryptResponseInterceptor)
  GetAjuste(@Param('data_entrada') data_entrada: string) {
    return this.precificacaoService.GetAjuste(data_entrada);
  }

  @Get('todas/:data_entrada')
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @SetRoutePolicy(RoutePolicy.getPrecificacao)
  @UseInterceptors(ChangeDataInterceptor)
  @UseInterceptors(EncryptResponseInterceptor)
  GetEntradaNf(@Param('data_entrada') data_entrada: string) {
    return this.precificacaoService.GetEntradaNf(data_entrada);
  }

  @Get('prevenda/:data_entrada')
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @SetRoutePolicy(RoutePolicy.getPrecificacao)
  @UseInterceptors(ChangeDataInterceptor)
  @UseInterceptors(EncryptResponseInterceptor)
  GetPreVenda(@Param('data_entrada') data_entrada: string) {
    return this.precificacaoService.GetPreVenda(data_entrada);
  }

  @Post()
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @SetRoutePolicy(RoutePolicy.upsertPrecificacao)
  UpdatePreco(@Body() dados: UpdatePrecoDto) {
    return this.precificacaoService.UpdatePreco(dados);
  }
}
