import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';

import appConfig from './app.config';

import { RequestLoggerMiddleware } from 'src/common/middleware/RequestLogger.middleware';
import { DatabaseModule } from 'src/common/database/database.module';
import { AuthModule } from 'src/auth/auth.module';
import { ApiAdmModule } from 'src/apiAdm/apiadm.module';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { MyExceptionFilter } from 'src/common/filters/my-exception.filter';

import { CryptoModule } from 'src/crypto/crypto.module';
import { envValidationSchema } from 'src/config/env.validation';
import { SchedulerModule } from 'src/scheduler/scheduler.module';
import { JuitaModule } from 'src/juita/Juita.module';
import { BiModule } from 'src/bi/bi.module';
import { BoicasadoModule } from 'src/boicasado/boicasado.module';
import { SiteModule } from 'src/site/site.module';

@Module({
  imports: [
    SchedulerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema: envValidationSchema,
      envFilePath: ['.env', '.env.email']
    }),
    CryptoModule,
    DatabaseModule,
    AuthModule,
    ApiAdmModule,
    SiteModule,
    JuitaModule,
    BoicasadoModule,
    BiModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: MyExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
