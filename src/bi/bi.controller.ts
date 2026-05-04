import {
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BiService } from './bi.service';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { EncryptResponseInterceptor } from 'src/common/interceptors/encrypt-response.interceptor';

@Controller('bi')
export class BiController {
  constructor(private readonly biService: BiService) {}

  @Get()
  @UseGuards(AuthTokenGuard)
  @UseInterceptors(EncryptResponseInterceptor)
  GetVendaMes() {
    return this.biService.GetVendaMes();
  }
  @Get(':datainicio/:datafim')
  @UseGuards(AuthTokenGuard)
  @UseInterceptors(EncryptResponseInterceptor)
  GetVendaData(
    @Param('datainicio') datainicio: string,
    @Param('datafim') datafim: string,
  ) {
    return this.biService.GetVendaData(datainicio, datafim);
  }
}
