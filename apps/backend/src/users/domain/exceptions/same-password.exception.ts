// NUEVO
import { BadRequestException } from '@nestjs/common';

export class SamePasswordException extends BadRequestException {
  constructor() {
    super('La contraseña nueva debe ser distinta de la actual.');
  }
}