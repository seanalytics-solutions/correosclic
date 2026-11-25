// NUEVO: 400 y no 401, para que la app no intente renovar ni cierre la sesión
import { BadRequestException } from '@nestjs/common';

export class InvalidCurrentPasswordException extends BadRequestException {
  constructor() {
    super('La contraseña actual es incorrecta.');
  }
}