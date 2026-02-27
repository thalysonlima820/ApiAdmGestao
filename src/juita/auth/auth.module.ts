import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { AuthTokenGuard } from './guards/auth-token.guard';
import { RoutePolicyGuard } from './guards/route-policy.guard';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthTokenGuard,
    RoutePolicyGuard,
    {
      provide: HashingService,
      useClass: BcryptService,
    },
  ],
  exports: [
    HashingService,
    JwtModule,
    ConfigModule,
    AuthTokenGuard,
    RoutePolicyGuard,
  ],
})
export class AuthModule {}
