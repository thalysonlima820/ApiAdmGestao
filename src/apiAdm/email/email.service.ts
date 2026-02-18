import { Injectable } from '@nestjs/common';
import { EmailClient } from './hashing/email.client';

@Injectable()
export class EmailService {
  constructor(private readonly emailClient: EmailClient) {}
  
  sendEmail(
    to: string[],
    subject: string,
    html: string,
    text: string,
  ): Promise<void> {
    return this.emailClient.sendEmail({ to, subject, html, text });
  }
  
}
