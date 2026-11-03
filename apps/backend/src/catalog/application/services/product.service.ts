import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '../../infrastructure/repositories/product.repository';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { CategoryNotFoundException } from 'src/catalog/domain/exceptions/category-not-found.exception';
import { SellerRepository } from 'src/catalog/infrastructure/repositories/seller.repository';
import { ProductNotFoundException } from '../../domain/exceptions/product-not-found.exception';
import { StoreNotFoundException } from '../../domain/exceptions/store-not-found.exception';
import { ProductNotPublishableException } from '../../domain/exceptions/product-not-publishable.exception';
import { ProductPublicationPolicy } from '../../domain/services/product-publication.policy';
import { SellerProductListResponseDto } from '../dto/seller-product-list-response.dto';
import { SellerProductDetailResponseDto } from '../dto/seller-product-detail-response.dto';
import {
  PublicProductListResponseDto,
  PublicProductDetailResponseDto,
} from '../dto/public-product-response.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly sellerRepository: SellerRepository,
    private readonly publicationPolicy: ProductPublicationPolicy,
  ) {}

  /**
   * La tienda del usuario acota toda operación sobre productos: es el control
   * de ownership de este servicio.
   */
  private async findOwnStoreOrThrow(userId: string) {
    const store = await this.sellerRepository.findStoreByUserId(userId);

    if (!store) {
      throw new StoreNotFoundException();
    }

    return store;
  }

  /** "Mis productos", paginado. `limit` se acota a 100 como en Orders. */
  async findMine(
    userId: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<SellerProductListResponseDto> {
    const store = await this.findOwnStoreOrThrow(userId);

    const pagina = Math.max(1, Math.trunc(page) || 1);
    const tamano = Math.min(100, Math.max(1, Math.trunc(limit) || 20));

    const { productos, total } = await this.productRepository.findManyByStoreId(
      {
        tiendaId: store.id,
        skip: (pagina - 1) * tamano,
        take: tamano,
        search,
      },
    );

    return {
      products: productos.map((producto) => {
        const precios = producto.variantes.map((variante) =>
          Number(variante.precio),
        );

        return {
          id: producto.id,
          codigoPublico: producto.codigoPublico,
          nombre: producto.nombre,
          categoria: producto.categoria,
          imagenPrincipalUrl: producto.imagenes[0]?.url ?? null,
          activo: producto.activo,
          publicado: producto.publicado,
          precioDesde: precios.length > 0 ? Math.min(...precios) : null,
          stockTotal: producto.variantes
            .filter((variante) => variante.activa)
            .reduce(
              (suma, variante) =>
                suma + (variante.inventario?.stockDisponible ?? 0),
              0,
            ),
          totalVariantes: producto.variantes.length,
          createdAt: producto.createdAt,
        };
      }),

      page: pagina,
      limit: tamano,
      total,
      totalPages: Math.ceil(total / tamano),
    };
  }

  /** Detalle de un producto propio, con variantes, stock, atributos e imágenes. */
  async findMineById(
    userId: string,
    productId: string,
  ): Promise<SellerProductDetailResponseDto> {
    const store = await this.findOwnStoreOrThrow(userId);

    const producto = await this.productRepository.findDetailByIdAndStoreId(
      productId,
      store.id,
    );

    if (!producto) {
      throw new ProductNotFoundException();
    }

    return {
      id: producto.id,
      codigoPublico: producto.codigoPublico,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      pesoKg: Number(producto.pesoKg),
      altoCm: producto.altoCm !== null ? Number(producto.altoCm) : null,
      anchoCm: producto.anchoCm !== null ? Number(producto.anchoCm) : null,
      largoCm: producto.largoCm !== null ? Number(producto.largoCm) : null,
      activo: producto.activo,
      publicado: producto.publicado,
      createdAt: producto.createdAt,
      categoria: producto.categoria,
      imagenes: producto.imagenes.map((imagen) => ({
        id: imagen.id,
        url: imagen.url,
        orden: imagen.orden,
        esPrincipal: imagen.esPrincipal,
      })),

      variantes: producto.variantes.map((variante) => ({
        id: variante.id,
        sku: variante.sku,
        precio: Number(variante.precio),
        pesoKg: variante.pesoKg !== null ? Number(variante.pesoKg) : null,
        activa: variante.activa,
        stockDisponible: variante.inventario?.stockDisponible ?? null,
        stockReservado: variante.inventario?.stockReservado ?? null,
        stockMinimo: variante.inventario?.stockMinimo ?? null,
        atributos: variante.valores.map((valor) => ({
          atributoId: valor.valorAtributo.atributo.id,
          atributo: valor.valorAtributo.atributo.nombre,
          valorId: valor.valorAtributo.id,
          valor: valor.valorAtributo.valor,
        })),
      })),
    };
  }
  /** Catálogo público, paginado. `limit` se acota a 100 como en Mine. */
  async findPublic(
    page: number,
    limit: number,
    search?: string,
    categoriaId?: string,
  ): Promise<PublicProductListResponseDto> {
    const pagina = Math.max(1, Math.trunc(page) || 1);
    const tamano = Math.min(100, Math.max(1, Math.trunc(limit) || 20));

    const { productos, total } = await this.productRepository.findManyPublic({
      skip: (pagina - 1) * tamano,
      take: tamano,
      search,
      categoriaId,
    });

    return {
      products: productos.map((producto) => {
        const variantesConStock = producto.variantes.filter(
          (variante) => (variante.inventario?.stockDisponible ?? 0) > 0,
        );

        const precios = variantesConStock.map((variante) =>
          Number(variante.precio),
        );

        return {
          id: producto.id,
          codigoPublico: producto.codigoPublico,
          nombre: producto.nombre,
          categoria: producto.categoria,
          tienda: producto.tienda,
          imagenPrincipalUrl: producto.imagenes[0]?.url ?? null,
          precioDesde: precios.length > 0 ? Math.min(...precios) : null,
          disponible: precios.length > 0,
        };
      }),

      page: pagina,
      limit: tamano,
      total,
      totalPages: Math.ceil(total / tamano),
    };
  }

  /** Detalle público de un producto. Lanza 404 si no existe, no está publicado o no está activo. */
  async findPublicById(
    productId: string,
  ): Promise<PublicProductDetailResponseDto> {
    const producto = await this.productRepository.findPublicDetailById(productId);
    if (!producto) {
      throw new ProductNotFoundException();
    }

    return {
      id: producto.id,
      codigoPublico: producto.codigoPublico,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      categoria: producto.categoria,
      tienda: producto.tienda,
      imagenes: producto.imagenes.map((imagen) => ({
        id: imagen.id,
        url: imagen.url,
        esPrincipal: imagen.esPrincipal,
      })),

      variantes: producto.variantes.map((variante) => ({
        id: variante.id,
        sku: variante.sku,
        precio: Number(variante.precio),
        stockDisponible: variante.inventario?.stockDisponible ?? 0,
        atributos: variante.valores.map((valor) => ({
          atributo: valor.valorAtributo.atributo.nombre,
          valor: valor.valorAtributo.valor,
        })),
      })),
    };
  }

  /**
   * Publica o retira de publicación un producto propio.
   *
   * `Producto.publicado` nacía en `false` y ningún servicio lo actualizaba,
   * mientras el carrito rechaza los productos no publicados: un producto dado
   * de alta por la API nunca podía venderse.
   *
   * Publicar exige que el producto esté realmente listo para venderse
   * (`ProductPublicationPolicy`); retirarlo de publicación no exige nada,
   * porque un vendedor siempre debe poder sacar su producto del catálogo.
   */
  async updatePublication(
    userId: string,
    productId: string,
    publicado: boolean,
  ): Promise<SellerProductDetailResponseDto> {
    const store = await this.findOwnStoreOrThrow(userId);

    if (publicado) {
      await this.assertPublishable(productId, store.id);
    }

    const actualizados = await this.productRepository.updatePublication(
      productId,
      store.id,
      publicado,
    );

    if (actualizados === 0) {
      throw new ProductNotFoundException();
    }

    return this.findMineById(userId, productId);
  }

  private async assertPublishable(
    productId: string,
    tiendaId: string,
  ): Promise<void> {
    const producto = await this.productRepository.findSalabilityByIdAndStoreId(
      productId,
      tiendaId,
    );

    // Se comprueba aquí y no tras el update para que un producto inexistente o
    // ajeno siga respondiendo 404, no 409.
    if (!producto) {
      throw new ProductNotFoundException();
    }

    const resultado = this.publicationPolicy.puedePublicarse(
      producto.variantes.map((variante) => ({
        activa: variante.activa,
        stockDisponible: variante.inventario?.stockDisponible ?? null,
      })),
    );

    if (!resultado.publicable) {
      throw new ProductNotPublishableException(resultado.motivo);
    }
  }

  async create(
    userId: string,
    dto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const store = await this.sellerRepository.findStoreByUserId(userId);

    if (!store) {
      throw new NotFoundException(
        'El vendedor no tiene una tienda registrada.',
      );
    }

    const category = await this.categoryRepository.findById(dto.categoriaId);

    if (!category) {
      throw new CategoryNotFoundException();
    }

    const product = await this.productRepository.create({
      tiendaId: store.id,
      categoriaId: dto.categoriaId,
      codigoPublico: this.generateProductCode(),
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      pesoKg: dto.pesoKg,
    });

    return {
      id: product.id,
      codigoPublico: product.codigoPublico,
      nombre: product.nombre,
      descripcion: product.descripcion ?? undefined,
      pesoKg: Number(product.pesoKg),
      activo: product.activo,
      publicado: product.publicado,
      createdAt: product.createdAt,
    };
  }
  private generateProductCode(): string {
    const random = Math.floor(100000 + Math.random() * 900000); // Genera un número aleatorio de 6 dígitos

    return `CCP-${random}`;
  }
}
