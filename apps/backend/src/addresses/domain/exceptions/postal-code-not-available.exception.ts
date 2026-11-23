// NUEVO
import { BadRequestException } from '@nestjs/common';

export class PostalCodeNotAvailableException extends BadRequestException {
  constructor(codigo: string) {
    super(`El código postal ${codigo} no está disponible para envíos.`);
  }
}
