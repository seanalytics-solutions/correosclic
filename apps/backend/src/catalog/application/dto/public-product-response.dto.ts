export class PublicProductListItemDto {
  id!: string;
  codigoPublico!: string;
  nombre!: string;
  categoria!: { id: string; nombre: string };
  tienda!: { id: string; nombre: string };
  imagenPrincipalUrl!: string | null;
  /** `min(variantes.precio)` entre variantes activas; null si ninguna tiene stock. */
  precioDesde!: number | null;
  disponible!: boolean;
}

export class PublicProductListResponseDto {
  products!: PublicProductListItemDto[];
  page!: number;
  limit!: number;
  total!: number;
  totalPages!: number;
}

export class PublicVariantAttributeDto {
  atributo!: string;
  valor!: string;
}

export class PublicProductVariantDto {
  id!: string;
  sku!: string;
  precio!: number;
  stockDisponible!: number;
  atributos!: PublicVariantAttributeDto[];
}

export class PublicProductImageDto {
  id!: string;
  url!: string;
  esPrincipal!: boolean;
}

export class PublicProductDetailResponseDto {
  id!: string;
  codigoPublico!: string;
  nombre!: string;
  descripcion!: string | null;
  categoria!: { id: string; nombre: string };
  tienda!: { id: string; nombre: string };
  imagenes!: PublicProductImageDto[];
  variantes!: PublicProductVariantDto[];
}
