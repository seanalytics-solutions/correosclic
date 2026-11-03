import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerService } from './mailer.service';
import { NodemailerMailerService } from './nodemailer-mailer.service';

@Module({
  imports: [ConfigModule], // si MailerService usa ConfigService para credenciales SMTP/Mailtrap
  providers: [
    {
      provide: MailerService,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      useClass: NodemailerMailerService,
    },
  ],
  exports: [MailerService],
})
export class MailerModule {}
