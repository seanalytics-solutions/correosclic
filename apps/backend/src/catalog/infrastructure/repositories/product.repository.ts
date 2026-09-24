import { Injectable } from '@nestjs/common';
import { Producto } from '@correosclic/database';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    tiendaId: string;
    categoriaId: string;
    codigoPublico: string;
    nombre: string;
    descripcion?: string;
    pesoKg: number;
  }): Promise<Producto> {
    return this.prisma.producto.create({
      data: {
        tiendaId: data.tiendaId,
        categoriaId: data.categoriaId,
        codigoPublico: data.codigoPublico,
        nombre: data.nombre,
        descripcion: data.descripcion,
        pesoKg: data.pesoKg,
      },
    });
  }

  async findById(id: string): Promise<Producto | null> {
    return this.prisma.producto.findUnique({
      where: {
        id,
      },
    });
  }

  async findByCodigoPublico(codigoPublico: string): Promise<Producto | null> {
    return this.prisma.producto.findUnique({
      where: {
        codigoPublico,
      },
    });
  }

  async findByIdAndStoreId(
    productoId: string,
    tiendaId: string,
  ): Promise<Producto | null> {
    return this.prisma.producto.findFirst({
      where: {
        id: productoId,
        tiendaId,
      },
    });
  }

  /** Productos de una tienda, paginados. El filtro por tienda es el control de ownership. */
  async findManyByStoreId(params: {
    tiendaId: string;
    skip: number;
    take: number;
    search?: string;
  }) {
    const where = {
      tiendaId: params.tiendaId,
      ...(params.search && {
        OR: [
          {
            nombre: {
              contains: params.search,
              mode: 'insensitive' as const,
            },
          },
          {
            codigoPublico: {
              contains: params.search,
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
    };

    const [productos, total] = await this.prisma.$transaction([
      this.prisma.producto.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: params.skip,
        take: params.take,
        select: {
          id: true,
          codigoPublico: true,
          nombre: true,
          activo: true,
          publicado: true,
          createdAt: true,
          categoria: { select: { id: true, nombre: true } },
          imagenes: {
            where: { esPrincipal: true },
            take: 1,
            select: { url: true },
          },
          variantes: {
            select: {
              precio: true,
              activa: true,
              inventario: { select: { stockDisponible: true } },
            },
          },
        },
      }),

      this.prisma.producto.count({ where }),
    ]);

    return { productos, total };
  }

  /** Detalle completo de un producto de la tienda, con variantes, stock e imágenes. */
  async findDetailByIdAndStoreId(productoId: string, tiendaId: string) {
    return this.prisma.producto.findFirst({
      where: { id: productoId, tiendaId },
      select: {
        id: true,
        codigoPublico: true,
        nombre: true,
        descripcion: true,
        pesoKg: true,
        altoCm: true,
        anchoCm: true,
        largoCm: true,
        activo: true,
        publicado: true,
        createdAt: true,
        categoria: { select: { id: true, nombre: true } },
        imagenes: {
          orderBy: { orden: 'asc' },
          select: { id: true, url: true, orden: true, esPrincipal: true },
        },
        variantes: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            sku: true,
            precio: true,
            pesoKg: true,
            activa: true,
            inventario: {
              select: {
                stockDisponible: true,
                stockReservado: true,
                stockMinimo: true,
                // stockMaximo: true,
              },
            },
            valores: {
              select: {
                valorAtributo: {
                  select: {
                    id: true,
                    valor: true,
                    atributo: { select: { id: true, nombre: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  /** Lo mínimo para decidir si el producto puede publicarse, sin traer el detalle completo. */
  async findSalabilityByIdAndStoreId(productoId: string, tiendaId: string) {
    return this.prisma.producto.findFirst({
      where: { id: productoId, tiendaId },
      select: {
        id: true,
        variantes: {
          select: {
            activa: true,
            inventario: { select: { stockDisponible: true } },
          },
        },
      },
    });
  }

  /** Publica o retira de publicación. El filtro por tienda impide tocar productos ajenos. */
  async updatePublication(
    productoId: string,
    tiendaId: string,
    publicado: boolean,
  ): Promise<number> {
    const result = await this.prisma.producto.updateMany({
      where: { id: productoId, tiendaId },
      data: { publicado },
    });

    return result.count;
  }
  /** Catálogo público: productos publicados y activos, sin restricción de tienda. */
  async findManyPublic(params: {
    skip: number;
    take: number;
    search?: string;
    categoriaId?: string;
  }) {
    const where = {
      publicado: true,
      activo: true,
      tienda: { activa: true },
      ...(params.categoriaId && { categoriaId: params.categoriaId }),
      ...(params.search && {
        nombre: {
          contains: params.search,
          mode: 'insensitive' as const,
        },
      }),
    };
    const [productos, total] = await this.prisma.$transaction([
      this.prisma.producto.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: params.skip,
        take: params.take,
        select: {
          id: true,
          codigoPublico: true,
          nombre: true,
          createdAt: true,
          tienda: { select: { id: true, nombre: true } },
          categoria: { select: { id: true, nombre: true } },
          imagenes: {
            where: { esPrincipal: true },
            take: 1,
            select: { url: true },
          },
          variantes: {
            where: { activa: true },
            select: {
              precio: true,
              inventario: { select: { stockDisponible: true } },
            },
          },
        },
      }),

      this.prisma.producto.count({ where }),
    ]);

    return { productos, total };
  }

  /** Detalle público de un producto: solo si está publicado y activo. */
  async findPublicDetailById(productoId: string) {
    return this.prisma.producto.findFirst({
      where: {
        id: productoId,
        publicado: true,
        activo: true,
        tienda: { activa: true },
      },
      select: {
        id: true,
        codigoPublico: true,
        nombre: true,
        descripcion: true,
        createdAt: true,
        tienda: { select: { id: true, nombre: true } },
        categoria: { select: { id: true, nombre: true } },
        imagenes: {
          orderBy: { orden: 'asc' },
          select: { id: true, url: true, orden: true, esPrincipal: true },
        },
        variantes: {
          where: { activa: true },
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            sku: true,
            precio: true,
            inventario: {
              select: { stockDisponible: true },
            },
            valores: {
              select: {
                valorAtributo: {
                  select: {
                    id: true,
                    valor: true,
                    atributo: { select: { id: true, nombre: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
