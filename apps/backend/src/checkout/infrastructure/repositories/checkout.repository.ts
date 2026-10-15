import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CheckoutRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findCartForCheckout(clienteId: string) {
    return this.prisma.carrito.findUnique({
      where: {
        clienteId,
      },
      select: {
        id: true,

        items: {
          select: {
            id: true,
            cantidad: true,

            productoVariante: {
              select: {
                id: true,
                sku: true,
                precio: true,
                pesoKg: true,

                inventario: {
                  select: {
                    stockDisponible: true,
                  },
                },

                producto: {
                  select: {
                    id: true,
                    nombre: true,
                    largoCm: true,
                    anchoCm: true,
                    altoCm: true,

                    imagenes: {
                      where: {
                        esPrincipal: true,
                      },
                      select: {
                        url: true,
                      },
                      take: 1,
                    },

                    tienda: {
                      select: {
                        nombre: true,
                        vendedorId: true,

                        vendedor: {
                          select: {
                            id: true,

                            estadoOperacion: {
                              select: {
                                id: true,
                                nombre: true,
                                latitud: true,
                                longitud: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },

                valores: {
                  select: {
                    valorAtributo: {
                      select: {
                        valor: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findPrincipalDeliveryAddress(clienteId: string) {
    return this.prisma.direccionCliente.findFirst({
      where: {
        clienteId,
        esPrincipal: true,
      },
      select: {
        direccion: {
          select: {
            id: true,

            codigoPostal: {
              select: {
                latitud: true,
                longitud: true,
              },
            },
          },
        },
      },
    });
  }

  async findDeliveryAddressById(clienteId: string, direccionId: string) {
    return this.prisma.direccionCliente.findFirst({
      where: {
        clienteId,
        direccionId,
      },
      select: {
        direccion: {
          select: {
            id: true,

            codigoPostal: {
              select: {
                latitud: true,
                longitud: true,
              },
            },
          },
        },
      },
    });
  }

  async findAddressesByClientId(clienteId: string) {
    return this.prisma.direccionCliente.findMany({
      where: {
        clienteId,
      },
      select: {
        esPrincipal: true,

        direccion: {
          select: {
            id: true,
            alias: true,
            direccionFormateada: true,
          },
        },
      },
      orderBy: {
        esPrincipal: 'desc',
      },
    });
  }

  async findZonaByDistancia(distanciaKm: number) {
    return this.prisma.zonaTarifaria.findFirst({
      where: {
        activa: true,
        distanciaMinKm: {
          lte: distanciaKm,
        },
        OR: [
          {
            distanciaMaxKm: null,
          },
          {
            distanciaMaxKm: {
              gt: distanciaKm,
            },
          },
        ],
      },
      orderBy: {
        distanciaMinKm: 'asc',
      },
    });
  }

  async findTarifaByZonaYPeso(
    zonaTarifariaId: string,
    pesoKg: number,
    fecha: Date = new Date(),
  ) {
    return this.prisma.tarifaEnvio.findFirst({
      where: {
        zonaTarifariaId,
        activa: true,
        pesoMinKg: {
          lte: pesoKg,
        },
        pesoMaxKg: {
          gt: pesoKg,
        },
        vigenteDesde: {
          lte: fecha,
        },
        OR: [
          {
            vigenteHasta: null,
          },
          {
            vigenteHasta: {
              gte: fecha,
            },
          },
        ],
      },
      orderBy: {
        vigenteDesde: 'desc',
      },
    });
  }
}

export type CheckoutCart = Awaited<
  ReturnType<CheckoutRepository['findCartForCheckout']>
>;
export type CheckoutCartAggregate = NonNullable<CheckoutCart>;
export type CheckoutCartItem = CheckoutCartAggregate['items'][number];

export type CheckoutAddressRecord = Awaited<
  ReturnType<CheckoutRepository['findAddressesByClientId']>
>[number];
