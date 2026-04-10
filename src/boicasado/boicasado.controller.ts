import { Controller, Get, Param } from '@nestjs/common';
import { BoicasadoService } from './boicasado.service';

@Controller('boicasado')
export class BoicasadoController {
  constructor(private readonly boicasadoService: BoicasadoService) {}

  @Get('total/entrada/:datainicio/:datafim/:filial')
  TotalEntrada(
    @Param('datainicio') datainicio: string,
    @Param('datafim') datafim: string,
    @Param('filial') filial: string,
  ) {
    return this.boicasadoService.TotalEntrada(datainicio,datafim,filial);
  }
  @Get('total/explosao/:datainicio/:datafim/:filial')
  TotalExplosao(
    @Param('datainicio') datainicio: string,
    @Param('datafim') datafim: string,
    @Param('filial') filial: string,
  ) {
    return this.boicasadoService.TotalExplosao(datainicio,datafim,filial);
  }
  @Get('peca/explosao/:datainicio/:datafim/:filial')
  PecaExplosao(
    @Param('datainicio') datainicio: string,
    @Param('datafim') datafim: string,
    @Param('filial') filial: string,
  ) {
    return this.boicasadoService.PecaExplosao(datainicio,datafim,filial);
  }
  @Get('estoque/explosao/:datainicio/:datafim/:filial')
  EstoqueSaida(
    @Param('datainicio') datainicio: string,
    @Param('datafim') datafim: string,
    @Param('filial') filial: string,
  ) {
    return this.boicasadoService.EstoqueSaida(datainicio,datafim,filial);
  }
  @Get('entrada/saida/:datainicio/:datafim/:filial')
  Saida(
    @Param('datainicio') datainicio: string,
    @Param('datafim') datafim: string,
    @Param('filial') filial: string,
  ) {
    return this.boicasadoService.Saida(datainicio,datafim,filial);
  }

}
