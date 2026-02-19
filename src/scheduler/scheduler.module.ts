import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailSchedule } from './email/email.schedule';
import { DatabaseModule } from 'src/common/database/database.module';
import { EmailModule } from 'src/apiAdm/email/email.module';
import { EmailController } from './email/email-relatorio.controller';
import { EmailRelatorioService } from './email/email-relatorio.service';
import { TelegramModule } from 'src/apiAdm/telegram/telegram.module';
import { TelegramSchedule } from './telegram/telegram.schedule';
import { TelegramScheduleService } from './telegram/telegram-schedule.service';
import { TelegramScheduleController } from './telegram/telegram-schedule.controller';

@Module({
  imports: [ScheduleModule.forRoot(), DatabaseModule, EmailModule, TelegramModule],
  controllers: [EmailController, TelegramScheduleController],
  providers: [
    EmailSchedule, EmailRelatorioService, 
    TelegramSchedule, TelegramScheduleService
  ],
})
export class SchedulerModule {}
