import { Controller, Get } from '@nestjs/common';
import { BiService } from './bi.service';

@Controller('bi')
export class BiController {
  constructor(private readonly biService: BiService) {}

  @Get()
  GetVendaMes(){
    return this.biService.GetVendaMes()
  }
}
