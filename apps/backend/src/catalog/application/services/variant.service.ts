import { Injectable } from '@nestjs/common';

import { VariantRepository } from '../../infrastructure/repositories/variant.repository';
import { SellerRepository } from '../../infrastructure/repositories/seller.repository';

import { CreateProductVariantDto } from '../dto/create-product-variant.dto';
import { UpdateProductVariantDto } from '../dto/update-product-variant.dto'; // NUEVO
import { VariantNotFoundException } from '../../domain/exceptions/variant-not-found.exception'; // NUEVO
import { ProductVariantResponseDto } from '../dto/product-variant-response.dto';

import { ProductNotFoundException } from '../../domain/exceptions/product-not-found.exception';
import { VariantSkuAlreadyExistsException } from '../../domain/exceptions/variant-sku-already-exists.exception';
import { AttributeValueNotFoundException } from '../../domain/exceptions/attribute-value-not-found.exception';

import { SellerNotFoundException } from '../../../seller/domain/exceptions/seller-not-found.exception';

@Injectable()
export class VariantService {

  constructor(
    private readonly repository: VariantRepository,
    private readonly sellerRepository: SellerRepository,
  ) {}

  async create(
    userId: string,
    productId: string,
    dto: CreateProductVariantDto,
  ): Promise<ProductVariantResponseDto> {

    // Paso 1. Obtener tienda del vendedor
    const store =
      await this.sellerRepository.findStoreByUserId(
        userId,
      );

    if (!store) {
      throw new SellerNotFoundException();
    }

    // Paso 2. Obtener producto
    const product =
      await this.repository.findProductById(
        productId,
      );

    if (!product) {
      throw new ProductNotFoundException();
    }

    // Paso 3. Validar que el producto pertenece al vendedor
    if (
      product.tienda.id !== store.id
    ) {
      throw new ProductNotFoundException();
    }

    // Paso 4. Normalizar y validar SKU
    const sku =
      this.normalizeSku(
        dto.sku,
      );

    const existingSku =
      await this.repository.findVariantBySku(
        sku,
      );

    if (existingSku) {
      throw new VariantSkuAlreadyExistsException();
    }

    // Paso 5. Validar valores de atributo
    const values =
      await this.repository.findAttributeValuesByIds(
        dto.valorAtributoIds,
      );

    if (
      values.length !==
      dto.valorAtributoIds.length
    ) {
      throw new AttributeValueNotFoundException();
    }

    // Paso 6. Crear variante
    const variant =
      await this.repository.createVariantWithValues({

        productoId: product.id,

        sku,

        precio: dto.precio,

        pesoKg: dto.pesoKg,

        valorAtributoIds:
          dto.valorAtributoIds,

      });

    const response: ProductVariantResponseDto = {

      id: variant.id,

      sku: variant.sku,

      precio: Number(
        variant.precio,
      ),

      pesoKg:
        variant.pesoKg != null
          ? Number(variant.pesoKg)
          : undefined,

      activa: variant.activa,

      createdAt: variant.createdAt,

    };

    return response;

  }
  
  /** NUEVO: edita SKU, precio y peso de una variante del vendedor.
   *  Variante inexistente o de otra tienda → 404 (mismo criterio que inventario). */
  async update(
    userId: string,
    variantId: string,
    dto: UpdateProductVariantDto,
  ): Promise<ProductVariantResponseDto> {

    // Paso 1. Obtener tienda del vendedor
    const store =
      await this.sellerRepository.findStoreByUserId(
        userId,
      );

    if (!store) {
      throw new SellerNotFoundException();
    }

    // Paso 2. Validar que la variante pertenece al vendedor
    const owned =
      await this.repository.findByIdWithStore(
        variantId,
      );

    if (
      !owned ||
      owned.producto.tiendaId !== store.id
    ) {
      throw new VariantNotFoundException();
    }

    // Paso 3. Si cambia el SKU: normalizarlo y validar que no lo use otra variante
    let sku: string | undefined;

    if (dto.sku !== undefined) {
      sku =
        this.normalizeSku(
          dto.sku,
        );

      const existingSku =
        await this.repository.findVariantBySku(
          sku,
        );

      if (
        existingSku &&
        existingSku.id !== variantId
      ) {
        throw new VariantSkuAlreadyExistsException();
      }
    }

    // Paso 4. Guardar cambios
    const variant =
      await this.repository.updateVariant(
        variantId,
        {
          sku,
          precio: dto.precio,
          pesoKg: dto.pesoKg,
        },
      );

    const response: ProductVariantResponseDto = {

      id: variant.id,

      sku: variant.sku,

      precio: Number(
        variant.precio,
      ),

      pesoKg:
        variant.pesoKg != null
          ? Number(variant.pesoKg)
          : undefined,

      activa: variant.activa,

      createdAt: variant.createdAt,

    };

    return response;

  }

  private normalizeSku(
    sku: string,
  ): string {

    return sku
      .trim()
      .toUpperCase();

  }

}