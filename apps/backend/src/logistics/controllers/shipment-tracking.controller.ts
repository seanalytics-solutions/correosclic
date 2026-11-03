import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUserDto } from '../../auth/dto/authenticated-user.dto';

import { ShipmentRepository } from '../infrastructure/repositories/shipment.repository';
import { CourierRepository } from '../infrastructure/repositories/courier.repository';
import { ShipmentNotFoundException } from '../domain/exceptions/shipment-not-found.exception';

import { ShipmentResponseDto } from '../application/dto/shipment-response.dto';
import { ShipmentSummaryDto } from '../application/dto/shipment-summary.dto';

@Controller('logistics')
@UseGuards(JwtAuthGuard)
export class ShipmentTrackingController {
  constructor(
    private readonly shipmentRepository: ShipmentRepository,
    private readonly courierRepository: CourierRepository,
  ) {}

  @Get('orders/:pedidoId/shipments')
  async listByOrder(
    @CurrentUser() user: AuthenticatedUserDto,
    @Param('pedidoId', ParseUUIDPipe) pedidoId: string,
  ): Promise<ShipmentSummaryDto[]> {
    const cliente = await this.shipmentRepository.findClienteByUsuarioId(
      user.id,
    );

    if (!cliente) {
      throw new ShipmentNotFoundException();
    }

    const envios = await this.shipmentRepository.findByPedidoIdForClient(
      pedidoId,
      cliente.id,
    );

    return envios.map((envio) => ({
      id: envio.id,
      trackingInterno: envio.trackingInterno,
      estado: envio.estado,
      vendedorId: envio.pedidoVendedor.vendedorId,
      fechaEntregaEstimada: envio.fechaEntregaEstimada,
      fechaEntregaReal: envio.fechaEntregaReal,
    }));
  }

  @Get('vendors/me/pending-shipments')
  async listPendingForVendor(
    @CurrentUser() user: AuthenticatedUserDto,
  ): Promise<ShipmentSummaryDto[]> {
    const vendedor = await this.shipmentRepository.findVendedorByUsuarioId(
      user.id,
    );

    if (!vendedor || !vendedor.activo) {
      throw new ShipmentNotFoundException();
    }

    const envios = await this.shipmentRepository.findPendingByVendorId(
      vendedor.id,
    );

    return envios.map((envio) => ({
      id: envio.id,
      trackingInterno: envio.trackingInterno,
      estado: envio.estado,
      createdAt: envio.createdAt,
    }));
  }

  @Get('shipments/:id')
  async getById(
    @CurrentUser() user: AuthenticatedUserDto,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ShipmentResponseDto> {
    const envio = await this.shipmentRepository.findById(id);

    if (!envio) {
      throw new ShipmentNotFoundException();
    }

    const [cliente, vendedor, repartidor] = await Promise.all([
      this.shipmentRepository.findClienteByUsuarioId(user.id),
      this.shipmentRepository.findVendedorByUsuarioId(user.id),
      this.courierRepository.findByUsuarioId(user.id),
    ]);

    const esDelCliente = cliente?.id === envio.pedidoVendedor.pedido.clienteId;
    const esDelVendedor = vendedor?.id === envio.pedidoVendedor.vendedorId;
    // El repartidor solo ve los envíos que le fueron asignados, y solo
    // mientras la asignación exista: no puede consultar guías ajenas.
    const esSuEntrega =
      repartidor?.activo === true &&
      envio.entrega?.repartidorId === repartidor.id;

    if (!esDelCliente && !esDelVendedor && !esSuEntrega) {
      throw new ShipmentNotFoundException();
    }

    // CAMBIO: la dirección solo la ven el cliente dueño y el repartidor asignado
    const dto = ShipmentResponseDto.fromRecord(envio);
    if (!esDelCliente && !esSuEntrega) {
      dto.direccionEntrega = null;
    }
    return dto;
  }
}
