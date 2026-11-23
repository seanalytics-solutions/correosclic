// NUEVO: datos para editar el perfil propio (PATCH /api/users/me)
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { PHONE_REGEX } from '../../../auth/constants/regex.constants';

export class UpdateMeDto {

  // Obligatorio en la base: si viene, no puede ser null ni vacío
  @ValidateIf((o) => o.nombre !== undefined)
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres.' })
  readonly nombre?: string;

  @ValidateIf((o) => o.apellidoPaterno !== undefined)
  @IsString({ message: 'El apellido paterno debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El apellido paterno no puede estar vacío.' })
  @MaxLength(100, { message: 'El apellido paterno no puede superar los 100 caracteres.' })
  readonly apellidoPaterno?: string;

  // Opcional en la base: null lo borra
  @IsOptional()
  @IsString({ message: 'El apellido materno debe ser una cadena de texto.' })
  @MaxLength(100, { message: 'El apellido materno no puede superar los 100 caracteres.' })
  readonly apellidoMaterno?: string | null;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto.' })
  @Matches(PHONE_REGEX, {
    message: 'El teléfono debe estar en formato internacional E.164. Ejemplo: +526181234567.',
  })
  readonly telefono?: string | null;

}