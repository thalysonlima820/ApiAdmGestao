import { Module } from '@nestjs/common';
import { EntradaSaidaController } from './entrada-saida.controller';
import { EntradaSaidaService } from './entrada-saida.service';
import { AuthModule } from 'src/auth/auth.module';
import { CryptoModule } from 'src/crypto/crypto.module';

@Module({
  imports: [AuthModule, CryptoModule],
  controllers: [EntradaSaidaController],
  providers: [EntradaSaidaService]
})
export class EntradaSaidaModule {}
