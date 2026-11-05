// NUEVO
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateAddressDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  alias?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  calle: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  numeroExterior: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  numeroInterior?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  colonia?: string;

  @IsString()
  @Matches(/^\d{5}$/, {
    message: 'El código postal debe tener 5 dígitos.',
  })
  codigoPostal: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  referencias?: string;
}
