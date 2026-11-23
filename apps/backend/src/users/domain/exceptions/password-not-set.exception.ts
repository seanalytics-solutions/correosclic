// NUEVO: cuentas que entran con Google u otra cuenta externa (passwordHash null)
import { BadRequestException } from '@nestjs/common';

export class PasswordNotSetException extends BadRequestException {
  constructor() {
    super('Tu cuenta no usa contraseña: inicias sesión con una cuenta externa.');
  }
}