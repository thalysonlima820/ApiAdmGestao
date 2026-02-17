import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { EmailClient } from './hashing/email.client';
import { HttpEmailClient } from './hashing/http-email.client';
import { ConfigModule } from '@nestjs/config';
import emailConfig from './config/email.config';

@Module({
  imports: [ConfigModule.forFeature(emailConfig)],
  controllers:[EmailController],
  providers: [
    EmailService,
    {
      provide: EmailClient,
      useClass: HttpEmailClient,
    }
  ],
  exports: [EmailService]
})
export class EmailModule {}
