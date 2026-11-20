//NUEVO: datos para editar una variante del vendedor (PATCH /seller/products/variantes/:id)
import {
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
  IsString,
  Matches,
} from 'class-validator';

export class UpdateProductVariantDto {
  @IsOptional()
  @IsString()
  @Matches(/\S/, { message: 'sku no puede estar vacío' })
  @MaxLength(100)
  readonly sku?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  readonly precio?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.001)
  readonly pesoKg?: number;
}
