// NUEVO
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

// Datos ya resueltos (ids y coordenadas) para crear una Direccion
export interface NewAddressData {
  paisId: string;
  estadoProvinciaId: string;
  ciudadId: string;
  codigoPostalId: string;
  alias: string | null;
  calle: string;
  numeroExterior: string;
  numeroInterior: string | null;
  colonia: string | null;
  referencias: string | null;
  direccionFormateada: string;
  latitud: number;
  longitud: number;
}

@Injectable()
export class AddressesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByClientId(clienteId: string) {
    return this.prisma.direccionCliente.findMany({
      where: { clienteId },
      select: {
        esPrincipal: true,
        direccion: {
          select: {
            id: true,
            alias: true,
            calle: true,
            numeroExterior: true,
            numeroInterior: true,
            colonia: true,
            referencias: true,
            direccionFormateada: true,
            codigoPostal: { select: { codigo: true } },
            ciudad: { select: { nombre: true } },
            estadoProvincia: { select: { nombre: true } },
          },
        },
      },
      orderBy: [{ esPrincipal: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findPostalCode(codigo: string) {
    return this.prisma.codigoPostal.findFirst({
      where: { codigo, activo: true },
      select: {
        id: true,
        latitud: true,
        longitud: true,
        ciudad: {
          select: {
            id: true,
            nombre: true,
            estadoProvincia: {
              select: { id: true, nombre: true, paisId: true },
            },
          },
        },
      },
    });
  }

  async countByClientId(clienteId: string) {
    return this.prisma.direccionCliente.count({ where: { clienteId } });
  }

  async findLink(clienteId: string, direccionId: string) {
    return this.prisma.direccionCliente.findFirst({
      where: { clienteId, direccionId },
      select: { id: true, esPrincipal: true },
    });
  }

  // Crea la Direccion y su enlace con el cliente en una sola transacción
  async create(clienteId: string, data: NewAddressData, esPrincipal: boolean) {
    return this.prisma.$transaction(async (tx) => {
      const direccion = await tx.direccion.create({
        data,
        select: { id: true },
      });

      await tx.direccionCliente.create({
        data: { clienteId, direccionId: direccion.id, esPrincipal },
      });

      return direccion.id;
    });
  }

  // Quita la marca a todas y se la pone a la elegida
  async setPrincipal(clienteId: string, direccionId: string) {
    await this.prisma.$transaction([
      this.prisma.direccionCliente.updateMany({
        where: { clienteId, esPrincipal: true },
        data: { esPrincipal: false },
      }),
      this.prisma.direccionCliente.updateMany({
        where: { clienteId, direccionId },
        data: { esPrincipal: true },
      }),
    ]);
  }

  // Borra solo el enlace; la Direccion se conserva porque los pedidos la usan
  async removeLink(clienteId: string, direccionId: string, eraPrincipal: boolean) {
    await this.prisma.$transaction(async (tx) => {
      await tx.direccionCliente.deleteMany({ where: { clienteId, direccionId } });

      if (!eraPrincipal) return;

      const siguiente = await tx.direccionCliente.findFirst({
        where: { clienteId },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      });

      if (siguiente) {
        await tx.direccionCliente.update({
          where: { id: siguiente.id },
          data: { esPrincipal: true },
        });
      }
    });
  }
}

export type CustomerAddressRecord = Awaited<
  ReturnType<AddressesRepository['findByClientId']>
>[number];
