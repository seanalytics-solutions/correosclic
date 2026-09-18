// mailtrap-mailer.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export abstract class MailerService {
  abstract sendPasswordResetEmail(params: {
    to: string;
    resetToken: string;
    nombre: string;
  }): Promise<void>;
}

@Injectable()
export class MailtrapMailerService extends MailerService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    super();
    this.transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('MAILTRAP_HOST'),
      port: this.configService.getOrThrow<number>('MAILTRAP_PORT'),
      auth: {
        user: this.configService.getOrThrow<string>('MAILTRAP_USER'),
        pass: this.configService.getOrThrow<string>('MAILTRAP_PASS'),
      },
    });
  }

  async sendPasswordResetEmail(params: {
    to: string;
    resetToken: string;
    nombre: string;
  }): Promise<void> {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${params.resetToken}`;

    await this.transporter.sendMail({
      from: '"CorreosClic" <no-reply@correosclic.com>',
      to: params.to,
      subject: 'Recupera tu contraseña',
      html: `<p>Hola ${params.nombre},</p><p>Haz clic <a href="${resetUrl}">aquí</a> para restablecer tu contraseña. El enlace expira pronto.</p>`,
    });
  }
}
