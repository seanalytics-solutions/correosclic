// NUEVO: datos para cambiar la contraseña propia (POST /api/users/me/password)
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { PASSWORD_REGEX } from '../../../auth/constants/regex.constants';

export class ChangePasswordDto {

  @IsString({ message: 'La contraseña actual debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'Escribe tu contraseña actual.' })
  readonly currentPassword!: string;

  @IsString({ message: 'La contraseña nueva debe ser una cadena de texto.' })
  @Matches(PASSWORD_REGEX, {
    message:
      'La contraseña debe contener entre 8 y 64 caracteres, incluyendo al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.',
  })
  readonly newPassword!: string;

}