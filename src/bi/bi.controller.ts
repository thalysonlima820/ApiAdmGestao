import { Controller, Get, Param } from '@nestjs/common';
import { BiService } from './bi.service';

@Controller('bi')
export class BiController {
  constructor(private readonly biService: BiService) {}

  @Get()
  GetVendaMes() {
    return this.biService.GetVendaMes();
  }
  @Get(':datainicio/:datafim')
  GetVendaData(
    @Param('datainicio') datainicio: string,
    @Param('datafim') datafim: string,
  ) {
    return this.biService.GetVendaData(datainicio,datafim);
  }
}
