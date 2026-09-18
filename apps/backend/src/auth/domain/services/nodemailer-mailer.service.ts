import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailerService } from './mailer.service';

@Injectable()
export class NodemailerMailerService extends MailerService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    super();
    this.transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('SMTP_HOST'),
      port: this.configService.getOrThrow<number>('SMTP_PORT'),
      auth: {
        user: this.configService.getOrThrow<string>('SMTP_USER'),
        pass: this.configService.getOrThrow<string>('SMTP_PASSWORD'),
      },
    });
  }

  async sendPasswordResetEmail(params: {
    to: string;
    resetToken: string;
    nombre: string;
  }): Promise<void> {
    const resetUrl = `${this.configService.get('FRONTEND_URL') ?? 'http://localhost:3000'}/reset-password?token=${params.resetToken}`;

    await this.transporter.sendMail({
      from: this.configService.getOrThrow<string>('SMTP_FROM'),
      to: params.to,
      subject: 'Recupera tu contraseña - CorreosClic',
      html: `<p>Hola ${params.nombre},</p><p>Haz clic <a href="${resetUrl}">aquí</a> para restablecer tu contraseña. Si no solicitaste esto, ignora este correo.</p>`,
    });
  }
}