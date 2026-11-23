// NUEVO
import { Injectable } from '@nestjs/common';

import {
  AddressesRepository,
  CustomerAddressRecord,
} from '../../infrastructure/repositories/addresses.repository';
import { UserRepository } from '../../../auth/infrastructure/repositories/user.repository';

import { CreateAddressDto } from '../dto/create-address.dto';
import { CustomerAddressDto } from '../dto/customer-address.dto';

import { CustomerNotFoundException } from '../../domain/exceptions/customer-not-found.exception';
import { AddressNotFoundException } from '../../domain/exceptions/address-not-found.exception';
import { PostalCodeNotAvailableException } from '../../domain/exceptions/postal-code-not-available.exception';

@Injectable()
export class AddressesService {
  constructor(
    private readonly repository: AddressesRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async list(userId: string): Promise<CustomerAddressDto[]> {
    const client = await this.getClientByUserId(userId);
    return this.listByClient(client.id);
  }

  async create(
    userId: string,
    dto: CreateAddressDto,
  ): Promise<CustomerAddressDto[]> {
    const client = await this.getClientByUserId(userId);

    const codigo = dto.codigoPostal.trim();
    const codigoPostal = await this.repository.findPostalCode(codigo);

    if (
      !codigoPostal ||
      codigoPostal.latitud === null ||
      codigoPostal.longitud === null
    ) {
      throw new PostalCodeNotAvailableException(codigo);
    }

    const ciudad = codigoPostal.ciudad;
    const estado = ciudad.estadoProvincia;

    const calle = dto.calle.trim();
    const numeroExterior = dto.numeroExterior.trim();
    const numeroInterior = this.clean(dto.numeroInterior);
    const colonia = this.clean(dto.colonia);

    // La primera dirección del cliente queda como principal
    const total = await this.repository.countByClientId(client.id);

    await this.repository.create(
      client.id,
      {
        paisId: estado.paisId,
        estadoProvinciaId: estado.id,
        ciudadId: ciudad.id,
        codigoPostalId: codigoPostal.id,
        alias: this.clean(dto.alias),
        calle,
        numeroExterior,
        numeroInterior,
        colonia,
        referencias: this.clean(dto.referencias),
        direccionFormateada: this.formatAddress(
          calle,
          numeroExterior,
          numeroInterior,
          colonia,
          ciudad.nombre,
          estado.nombre,
          codigo,
        ),
        latitud: Number(codigoPostal.latitud),
        longitud: Number(codigoPostal.longitud),
      },
      total === 0,
    );

    return this.listByClient(client.id);
  }

  async setPrincipal(
    userId: string,
    direccionId: string,
  ): Promise<CustomerAddressDto[]> {
    const client = await this.getClientByUserId(userId);

    const link = await this.repository.findLink(client.id, direccionId);
    if (!link) {
      throw new AddressNotFoundException();
    }

    await this.repository.setPrincipal(client.id, direccionId);
    return this.listByClient(client.id);
  }

  async remove(
    userId: string,
    direccionId: string,
  ): Promise<CustomerAddressDto[]> {
    const client = await this.getClientByUserId(userId);

    const link = await this.repository.findLink(client.id, direccionId);
    if (!link) {
      throw new AddressNotFoundException();
    }

    await this.repository.removeLink(client.id, direccionId, link.esPrincipal);
    return this.listByClient(client.id);
  }

  private async listByClient(clienteId: string): Promise<CustomerAddressDto[]> {
    const records = await this.repository.findByClientId(clienteId);
    return records.map((record) => this.toDto(record));
  }

  private toDto(record: CustomerAddressRecord): CustomerAddressDto {
    const direccion = record.direccion;
    return {
      id: direccion.id,
      alias: direccion.alias,
      calle: direccion.calle,
      numeroExterior: direccion.numeroExterior,
      numeroInterior: direccion.numeroInterior,
      colonia: direccion.colonia,
      codigoPostal: direccion.codigoPostal.codigo,
      ciudad: direccion.ciudad.nombre,
      estadoProvincia: direccion.estadoProvincia.nombre,
      referencias: direccion.referencias,
      direccionFormateada: direccion.direccionFormateada,
      esPrincipal: record.esPrincipal,
    };
  }

  // "Av. 20 de Noviembre 100 int. 3, Centro, Durango, Durango, CP 34000"
  private formatAddress(
    calle: string,
    numeroExterior: string,
    numeroInterior: string | null,
    colonia: string | null,
    ciudad: string,
    estado: string,
    codigoPostal: string,
  ): string {
    const interior = numeroInterior ? ` int. ${numeroInterior}` : '';
    const coloniaTexto = colonia ? `, ${colonia}` : '';
    return `${calle} ${numeroExterior}${interior}${coloniaTexto}, ${ciudad}, ${estado}, CP ${codigoPostal}`;
  }

  // Quita espacios; si queda vacío, guarda null
  private clean(value?: string): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }

  private async getClientByUserId(userId: string) {
    const client = await this.userRepository.findClientByUserId(userId);
    if (!client) {
      throw new CustomerNotFoundException();
    }
    return client;
  }
}
