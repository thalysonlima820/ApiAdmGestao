import { Module } from '@nestjs/common';
import { LimiteController } from './limite.controller';
import { LimiteService } from './limite.service';
import { AuthModule } from 'src/auth/auth.module';
import { CryptoModule } from 'src/crypto/crypto.module';

@Module({
   imports: [AuthModule, CryptoModule],
  controllers: [LimiteController],
  providers: [LimiteService]
})
export class LimiteModule {}
