import { BadRequestException } from '@nestjs/common';

export class InvalidOrExpiredResetTokenException extends BadRequestException {
  constructor() {
    super('El enlace de recuperación no es válido o ha expirado.');
  }
}
