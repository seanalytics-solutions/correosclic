import { UnauthorizedException } from '@nestjs/common';

export class InvalidRefreshTokenException extends UnauthorizedException {
  constructor() {
    super('Sesión inválida o expirada. Inicia sesión nuevamente.');
  }
}
