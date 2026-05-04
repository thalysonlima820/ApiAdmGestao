import { Module } from '@nestjs/common';
import { BiController } from './bi.controller';
import { BiService } from './bi.service';
import { AuthModule } from 'src/auth/auth.module';
import { CryptoModule } from 'src/crypto/crypto.module';

@Module({
  imports: [AuthModule, CryptoModule],
  controllers: [BiController],
  providers: [BiService]
})
export class BiModule {}
