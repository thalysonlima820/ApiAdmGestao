import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './app.config';
import { RequestLoggerMiddleware } from 'src/common/middleware/RequestLogger.middleware';
import { DatabaseModule } from 'src/common/database/database.module';
import { AuthModule } from 'src/auth/auth.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { ApiAdmModule } from 'src/apiAdm/apiadm.module';
import { APP_FILTER } from '@nestjs/core';
import { MyExceptionFilter } from 'src/common/filters/my-exception.filter';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    DatabaseModule,
    AuthModule,
    ApiAdmModule,
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: MyExceptionFilter
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
