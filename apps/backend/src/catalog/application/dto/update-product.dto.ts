import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

//Nuevo: datos para editar un producto del vendedor (PATCH /seller/products/:id)
export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  readonly nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  readonly descripcion?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.001)
  readonly pesoKg?: number;
}
