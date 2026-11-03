import { EstadoEnvio, ResultadoIntentoEntrega } from '@correosclic/database';

import { ShipmentDetailRecord } from '../../infrastructure/repositories/shipment.repository';

export class TrackingEventDto {
  estado!: EstadoEnvio;
  descripcion!: string;
  createdAt!: Date;
}

export class DeliveryAttemptDto {
  id!: string;
  numeroIntento!: number;
  resultado!: ResultadoIntentoEntrega;
  observaciones!: string | null;
  fotoIntentoUrl!: string | null;
  createdAt!: Date;
}

export class ShipmentDeliveryDto {
  id!: string;
  repartidorId!: string;
  fechaAsignacion!: Date;
  fechaEntrega!: Date | null;
  nombreRecibe!: string | null;
  intentos!: DeliveryAttemptDto[];
}

/**
 * Transferencia troncal entre sucursales. Se expone porque
 * `POST /logistics/transfers/:id/arrival` necesita este `id`, y sin él no
 * había forma de confirmar la llegada desde fuera del backend.
 */
export class ShipmentTransferDto {
  id!: string;
  sucursalOrigenId!: string;
  sucursalDestinoId!: string;
  vehiculoId!: string;
  fechaSalida!: Date;
  fechaLlegada!: Date | null;
}

// NUEVO: dirección de entrega del pedido. Solo la reciben el cliente y el repartidor.
export class ShipmentDeliveryAddressDto {
  alias!: string | null;
  calle!: string;
  numeroExterior!: string;
  numeroInterior!: string | null;
  colonia!: string | null;
  referencias!: string | null;
  direccionFormateada!: string | null;
  codigoPostal!: string;
  ciudad!: string;
  estadoProvincia!: string;
  latitud!: number;
  longitud!: number;
}

export class ShipmentResponseDto {
  id!: string;
  trackingInterno!: string;
  estado!: EstadoEnvio;
  vendedorId!: string;
  sucursalOrigen!: { id: string; nombre: string };
  sucursalDestino!: { id: string; nombre: string };
  distanciaKm!: number | null;
  pesoRealKg!: number | null;
  fechaEntregaEstimada!: Date | null;
  fechaEntregaReal!: Date | null;
  entrega!: ShipmentDeliveryDto | null;
  transferencias!: ShipmentTransferDto[];
  historial!: TrackingEventDto[];
  direccionEntrega!: ShipmentDeliveryAddressDto | null;

  static fromRecord(record: ShipmentDetailRecord): ShipmentResponseDto {
    const dto = new ShipmentResponseDto();

    dto.id = record.id;
    dto.trackingInterno = record.trackingInterno;
    dto.estado = record.estado;
    dto.vendedorId = record.pedidoVendedor.vendedorId;
    dto.sucursalOrigen = record.sucursalOrigen;
    dto.sucursalDestino = record.sucursalDestino;
    dto.distanciaKm = record.distanciaKm ? Number(record.distanciaKm) : null;
    dto.pesoRealKg = record.pesoRealKg ? Number(record.pesoRealKg) : null;
    dto.fechaEntregaEstimada = record.fechaEntregaEstimada;
    dto.fechaEntregaReal = record.fechaEntregaReal;

    dto.entrega = record.entrega
      ? {
          id: record.entrega.id,
          repartidorId: record.entrega.repartidorId,
          fechaAsignacion: record.entrega.fechaAsignacion,
          fechaEntrega: record.entrega.fechaEntrega,
          nombreRecibe: record.entrega.nombreRecibe,
          intentos: record.entrega.intentos.map((intento) => ({
            id: intento.id,
            numeroIntento: intento.numeroIntento,
            resultado: intento.resultado,
            observaciones: intento.observaciones,
            fotoIntentoUrl: intento.fotoIntentoUrl,
            createdAt: intento.createdAt,
          })),
        }
      : null;

    dto.transferencias = record.transferencias.map((transferencia) => ({
      id: transferencia.id,
      sucursalOrigenId: transferencia.sucursalOrigenId,
      sucursalDestinoId: transferencia.sucursalDestinoId,
      vehiculoId: transferencia.vehiculoId,
      fechaSalida: transferencia.fechaSalida,
      fechaLlegada: transferencia.fechaLlegada,
    }));

    dto.historial = record.eventosTracking.map((evento) => ({
      estado: evento.estado,
      descripcion: evento.descripcion,
      createdAt: evento.createdAt,
    }));

    // NUEVO: dirección de entrega del pedido
    const dir = record.pedidoVendedor?.pedido?.direccionEntrega;
    dto.direccionEntrega = dir
      ? {
          alias: dir.alias,
          calle: dir.calle,
          numeroExterior: dir.numeroExterior,
          numeroInterior: dir.numeroInterior,
          colonia: dir.colonia,
          referencias: dir.referencias,
          direccionFormateada: dir.direccionFormateada,
          codigoPostal: dir.codigoPostal.codigo,
          ciudad: dir.ciudad.nombre,
          estadoProvincia: dir.estadoProvincia.nombre,
          latitud: Number(dir.latitud),
          longitud: Number(dir.longitud),
        }
      : null;

    return dto;
  }
}
