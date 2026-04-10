import { Module } from '@nestjs/common';
import { BoicasadoController } from './boicasado.controller';
import { BoicasadoService } from './boicasado.service';

@Module({
  controllers: [BoicasadoController],
  providers: [BoicasadoService]
})
export class BoicasadoModule {}
