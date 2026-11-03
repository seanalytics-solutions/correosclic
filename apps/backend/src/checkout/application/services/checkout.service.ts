import { Injectable } from '@nestjs/common';

import {
  CheckoutRepository,
  CheckoutCartItem,
  CheckoutAddressRecord,
} from '../../infrastructure/repositories/checkout.repository';

import { UserRepository } from '../../../auth/infrastructure/repositories/user.repository';
import { SystemConfigRepository } from '../../../system-config/infrastructure/repositories/system-config.repository';
import { ConfiguracionSistemaKey } from '../../../system-config/domain/configuracion-sistema-key';

import { CheckoutSummaryDto } from '../dto/checkout-summary.dto';
import { CheckoutItemDto } from '../dto/checkout-item.dto';
import { CheckoutAddressDto } from '../dto/checkout-address.dto';

import { CheckoutTotalService } from './checkout-total.service';
import { ShippingCalculatorService } from './shipping-calculator.service';

import { GeoCoordinates } from '../../../shared/geo/haversine-distance.calculator';
import { ShippingCalculationItem } from '../interfaces/shipping-calculation.interface';

import { roundCurrency, roundWeight } from '../../domain/utils/rounding.util';

import { EmptyCheckoutException } from '../../domain/exceptions/empty-checkout.exception';
import { CustomerNotFoundException } from '../../domain/exceptions/customer-not-found.exception';
import { DeliveryAddressNotFoundException } from '../../domain/exceptions/delivery-address-not-found.exception';
import { VendorOperatingStateNotFoundException } from '../../domain/exceptions/vendor-operating-state-not-found.exception';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly repository: CheckoutRepository,
    private readonly totals: CheckoutTotalService,
    private readonly shippingCalculator: ShippingCalculatorService,
    private readonly userRepository: UserRepository,
    private readonly systemConfigRepository: SystemConfigRepository,
  ) {}

  async getCheckout(
    userId: string,
    direccionId?: string,
  ): Promise<CheckoutSummaryDto> {
    const client = await this.getClientByUserId(userId);

    const cart = await this.repository.findCartForCheckout(client.id);

    if (!cart || cart.items.length === 0) {
      throw new EmptyCheckoutException();
    }

    const warnings = this.validateStock(cart.items);

    const items = cart.items.map((item) => this.toItemDto(item));

    const subtotal = this.totals.calculateSubtotal(
      cart.items.map((item) => ({
        precio: Number(item.productoVariante.precio),
        cantidad: item.cantidad,
      })),
    );

    const totalWeightKg = this.totals.calculateWeight(
      cart.items.map((item) => ({
        pesoKg: Number(item.productoVariante.pesoKg ?? 0),
        cantidad: item.cantidad,
      })),
    );

    const itemsCount = this.totals.calculateItems(
      cart.items.map((item) => ({
        cantidad: item.cantidad,
      })),
    );

    const { direccionId: resolvedDireccionId, ...destination } =
      await this.getDeliveryDestination(client.id, direccionId);

    const shippingItems = this.buildShippingItems(cart.items);

    const shippingResult = await this.shippingCalculator.calculate(
      shippingItems,
      destination,
    );

    const total = roundCurrency(subtotal + shippingResult.costoEnvio);

    const [ivaPercentage, commissionPercentage] = await Promise.all([
      this.systemConfigRepository.getNumber(
        ConfiguracionSistemaKey.IVA_PERCENTAGE,
      ),
      this.systemConfigRepository.getNumber(
        ConfiguracionSistemaKey.MARKETPLACE_COMMISSION,
      ),
    ]);

    const ivaIncluido = this.totals.extractTax(total, ivaPercentage);

    const comisionMarketplace = this.totals.calculateCommission(
      subtotal,
      commissionPercentage,
    );

    return {
      items,
      direccionId: resolvedDireccionId,
      itemsCount,
      subtotal,
      totalWeightKg,
      shipping: shippingResult.costoEnvio,
      total,
      ivaIncluido,
      comisionMarketplace,
      canCheckout: warnings.length === 0,
      warnings,
      envioDetalle: shippingResult.cotizacionesPorVendedor,
    };
  }

  async listAddresses(userId: string): Promise<CheckoutAddressDto[]> {
    const client = await this.getClientByUserId(userId);

    const addresses = await this.repository.findAddressesByClientId(client.id);

    return addresses.map((address) => this.toAddressDto(address));
  }

  private toAddressDto(address: CheckoutAddressRecord): CheckoutAddressDto {
    return {
      id: address.direccion.id,
      alias: address.direccion.alias,
      direccionFormateada: address.direccion.direccionFormateada,
      esPrincipal: address.esPrincipal,
    };
  }

  private toItemDto(item: CheckoutCartItem): CheckoutItemDto {
    const precioUnitario = Number(item.productoVariante.precio);

    const pesoUnitarioKg = Number(item.productoVariante.pesoKg ?? 0);

    return {
      productoId: item.productoVariante.producto.id,

      productoVarianteId: item.productoVariante.id,

      vendedorId: item.productoVariante.producto.tienda.vendedorId,

      nombreTienda: item.productoVariante.producto.tienda.nombre,

      nombre: item.productoVariante.producto.nombre,

      sku: item.productoVariante.sku,

      imagen: item.productoVariante.producto.imagenes[0]?.url ?? null,

      atributos: item.productoVariante.valores.map(
        (valor) => valor.valorAtributo.valor,
      ),

      cantidad: item.cantidad,

      precioUnitario,

      subtotal: roundCurrency(precioUnitario * item.cantidad),

      pesoKg: roundWeight(pesoUnitarioKg * item.cantidad),
    };
  }

  private validateStock(items: CheckoutCartItem[]): string[] {
    const warnings: string[] = [];

    for (const item of items) {
      const stockDisponible =
        item.productoVariante.inventario?.stockDisponible ?? 0;

      if (item.cantidad > stockDisponible) {
        warnings.push(
          `El producto "${item.productoVariante.producto.nombre}" (SKU ${item.productoVariante.sku}) ya no tiene stock suficiente: disponible ${stockDisponible}, solicitado ${item.cantidad}.`,
        );
      }
    }

    return warnings;
  }

  private buildShippingItems(
    items: CheckoutCartItem[],
  ): ShippingCalculationItem[] {
    return items.map((item) => {
      const vendedorId = item.productoVariante.producto.tienda.vendedorId;

      const nombreTienda = item.productoVariante.producto.tienda.nombre;

      const estadoOperacion =
        item.productoVariante.producto.tienda.vendedor.estadoOperacion;

      if (
        !estadoOperacion ||
        estadoOperacion.latitud === null ||
        estadoOperacion.longitud === null
      ) {
        throw new VendorOperatingStateNotFoundException(vendedorId);
      }

      return {
        vendedorId,
        nombreTienda,
        estadoOperacion: {
          latitud: Number(estadoOperacion.latitud),
          longitud: Number(estadoOperacion.longitud),
        },
        pesoKg: Number(item.productoVariante.pesoKg ?? 0),
        cantidad: item.cantidad,
        largoCm:
          item.productoVariante.producto.largoCm != null
            ? Number(item.productoVariante.producto.largoCm)
            : undefined,
        anchoCm:
          item.productoVariante.producto.anchoCm != null
            ? Number(item.productoVariante.producto.anchoCm)
            : undefined,
        altoCm:
          item.productoVariante.producto.altoCm != null
            ? Number(item.productoVariante.producto.altoCm)
            : undefined,
      };
    });
  }

  private async getDeliveryDestination(
    clienteId: string,
    direccionId?: string,
  ): Promise<GeoCoordinates & { direccionId: string }> {
    const direccionCliente = direccionId
      ? await this.repository.findDeliveryAddressById(clienteId, direccionId)
      : await this.repository.findPrincipalDeliveryAddress(clienteId);

    if (!direccionCliente) {
      throw new DeliveryAddressNotFoundException(
        direccionId
          ? 'La dirección de entrega indicada no existe o no pertenece al cliente.'
          : undefined,
      );
    }

    if (
      direccionCliente.direccion.codigoPostal.latitud === null ||
      direccionCliente.direccion.codigoPostal.longitud === null
    ) {
      throw new DeliveryAddressNotFoundException(
        'La dirección de entrega no tiene coordenadas registradas.',
      );
    }

    return {
      direccionId: direccionCliente.direccion.id,
      latitud: Number(direccionCliente.direccion.codigoPostal.latitud),
      longitud: Number(direccionCliente.direccion.codigoPostal.longitud),
    };
  }

  private async getClientByUserId(userId: string) {
    const client = await this.userRepository.findClientByUserId(userId);

    if (!client) {
      throw new CustomerNotFoundException();
    }

    return client;
  }
}
