// NUEVO
import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor() {
    super('Usuario no encontrado.');
  }
}