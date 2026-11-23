import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class VariantRepository {

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findProductById(
    productId: string,
  ) {
    return this.prisma.producto.findUnique({
      where: {
        id: productId,
      },
      include: {
        tienda: {
          include: {
            vendedor: true,
          },
        },
      },
    });
  }

  async findVariantBySku(
    sku: string,
  ) {
    return this.prisma.productoVariante.findUnique({
      where: {
        sku,
      },
    });
  }

  async findAttributeValuesByIds(
    ids: string[],
  ) {
    return this.prisma.valorAtributo.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

async createVariantWithValues(
  data: {
    productoId: string;
    sku: string;
    precio: number;
    pesoKg?: number;
    valorAtributoIds: string[];
  },
) {

  return this.prisma.$transaction(async (tx) => {

    const variant =
      await tx.productoVariante.create({
        data: {
          productoId: data.productoId,
          sku: data.sku,
          precio: data.precio,
          pesoKg: data.pesoKg,
        },
      });

      const relations =
        data.valorAtributoIds.map(
          valorAtributoId => ({
            productoVarianteId: variant.id,
            valorAtributoId,
          }),
        );

      await tx.productoVarianteValor.createMany({
        data: relations,
      });

    return variant;

  });

}
async findById(
  variantId: string,
) {
  return this.prisma.productoVariante.findUnique({
    where: {
      id: variantId,
    },
  });
}

/** La variante con la tienda dueña, para comprobar propiedad antes de tocar su inventario. */
async findByIdWithStore(
  variantId: string,
) {
  return this.prisma.productoVariante.findUnique({
    where: {
      id: variantId,
    },
    select: {
      id: true,
      producto: {
        select: {
          tiendaId: true,
        },
      },
    },
  });
}

/** NUEVO: edita SKU, precio y peso de una variante.
 *  La propiedad se comprueba antes en el service con findByIdWithStore. */
async updateVariant(
  variantId: string,
  data: { sku?: string; precio?: number; pesoKg?: number },
) {
  return this.prisma.productoVariante.update({
    where: {
      id: variantId,
    },
    data,
  });
}

async findCompleteById(
  variantId: string,
) {
  return this.prisma.productoVariante.findUnique({
    where: {
      id: variantId,
    },
    select: {
      id: true,
      activa: true,
      precio: true,

      inventario: {
        select: {
          id: true,
          stockDisponible: true,
        },
      },

      producto: {
        select: {
          id: true,
          activo: true,
          publicado: true,
        },
      },
    },
  });


}
}