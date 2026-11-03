import { Injectable } from '@nestjs/common';
import {
  EstadoEnvio,
  Prisma,
  ResultadoIntentoEntrega,
} from '@correosclic/database';

import { PrismaService } from '../../../prisma/prisma.service';

export interface CreateShipmentParams {
  pedidoVendedorId: string;
  sucursalOrigenId: string;
  sucursalDestinoId: string;
  trackingInterno: string;
  distanciaKm?: number;
  pedidoItemIds: { pedidoItemId: string; cantidad: number }[];
}

export interface ConfirmReceptionParams {
  envioId: string;
  empleadoId: string;
  /**
   * Estado en el que queda el envío tras la recepción, decidido por
   * LogisticsPlanningEngine.planReceptionOutcomePhase: RECIBIDO_SUCURSAL si se
   * aceptó, o DANADO / CANCELADO si el recepcionista certificó una incidencia.
   */
  estadoDestino: EstadoEnvio;
  observaciones?: string;
  /** Medido en báscula por el recepcionista al momento del escaneo. */
  pesoRealKg?: number;
}

export interface ClassifyAndRouteParams {
  envioId: string;
  decision: 'SIN_TRANSFERENCIA' | 'CREAR_TRANSFERENCIA' | 'SOLO_CLASIFICAR';
  vehiculoId?: string;
}

export interface ConfirmTransferArrivalParams {
  transferenciaId: string;
  envioId: string;
}

export interface AssignDeliveryParams {
  envioId: string;
  repartidorId: string;
}

export interface RecordDeliveryAttemptParams {
  entregaId: string;
  envioId: string;
  resultado: ResultadoIntentoEntrega;
  observaciones?: string;
  fotoIntentoUrl?: string;
  nombreRecibe?: string;
  esExitoso: boolean;
  esDevolucion: boolean;
}

const DESCRIPCION_POR_ESTADO: Record<EstadoEnvio, string> = {
  [EstadoEnvio.PENDIENTE_RECEPCION]:
    'Guía generada, en espera de recepción en sucursal.',
  [EstadoEnvio.RECIBIDO_SUCURSAL]: 'Paquete recibido en sucursal de origen.',
  [EstadoEnvio.CLASIFICADO]: 'Paquete clasificado para su siguiente etapa.',
  [EstadoEnvio.EN_TRANSITO]: 'Paquete en tránsito hacia la sucursal destino.',
  [EstadoEnvio.EN_SUCURSAL_DESTINO]: 'Paquete recibido en sucursal destino.',
  [EstadoEnvio.EN_REPARTO]: 'Paquete asignado a repartidor, en reparto.',
  [EstadoEnvio.ENTREGADO]: 'Paquete entregado al destinatario.',
  [EstadoEnvio.DEVUELTO]: 'Paquete devuelto al remitente.',
  [EstadoEnvio.CANCELADO]: 'Envío cancelado.',
  [EstadoEnvio.EXTRAVIADO]: 'Paquete reportado como extraviado.',
  [EstadoEnvio.DANADO]: 'Paquete reportado como dañado.',
};

/**
 * Un estado terminal certificado en recepción no puede quedar en el historial
 * sin su motivo: ahí las observaciones del recepcionista se anexan a la
 * descripción del evento para que el cliente vea por qué se detuvo su envío.
 *
 * En una recepción aceptada no se anexan: son notas internas de la operación,
 * viven en `RecepcionSucursal.observaciones` y no tienen por qué aparecer en el
 * seguimiento que ve el cliente.
 */
function describirEstado(estado: EstadoEnvio, observaciones?: string): string {
  const base = DESCRIPCION_POR_ESTADO[estado];

  const esDesenlaceAdverso =
    estado === EstadoEnvio.DANADO || estado === EstadoEnvio.CANCELADO;

  return esDesenlaceAdverso && observaciones
    ? `${base} Motivo: ${observaciones}`
    : base;
}

@Injectable()
export class ShipmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: CreateShipmentParams) {
    return this.prisma.$transaction(async (tx) => {
      const envio = await tx.envio.create({
        data: {
          pedidoVendedorId: params.pedidoVendedorId,
          sucursalOrigenId: params.sucursalOrigenId,
          sucursalDestinoId: params.sucursalDestinoId,
          trackingInterno: params.trackingInterno,
          estado: EstadoEnvio.PENDIENTE_RECEPCION,
          distanciaKm: params.distanciaKm,
          items: {
            create: params.pedidoItemIds.map((item) => ({
              pedidoItemId: item.pedidoItemId,
              cantidad: item.cantidad,
            })),
          },
        },
      });

      await tx.eventoTracking.create({
        data: {
          envioId: envio.id,
          estado: EstadoEnvio.PENDIENTE_RECEPCION,
          descripcion: DESCRIPCION_POR_ESTADO[EstadoEnvio.PENDIENTE_RECEPCION],
        },
      });

      return envio;
    });
  }

  async findById(id: string) {
    return this.prisma.envio.findUnique({
      where: { id },
      include: {
        pedidoVendedor: {
          include: {
            // CAMBIO: también la dirección de entrega (para el repartidor y el cliente)
            pedido: {
              select: {
                id: true,
                clienteId: true,
                direccionEntrega: {
                  select: {
                    alias: true,
                    calle: true,
                    numeroExterior: true,
                    numeroInterior: true,
                    colonia: true,
                    referencias: true,
                    direccionFormateada: true,
                    latitud: true,
                    longitud: true,
                    codigoPostal: { select: { codigo: true } },
                    ciudad: { select: { nombre: true } },
                    estadoProvincia: { select: { nombre: true } },
                  },
                },
              },
            },
          },
        },
        sucursalOrigen: { select: { id: true, nombre: true } },
        sucursalDestino: { select: { id: true, nombre: true } },
        entrega: {
          include: { intentos: { orderBy: { numeroIntento: 'asc' } } },
        },
        eventosTracking: { orderBy: { createdAt: 'asc' } },
        transferencias: { orderBy: { createdAt: 'asc' } },
      },
    });
  }

  async findByTrackingInterno(trackingInterno: string) {
    return this.prisma.envio.findUnique({
      where: { trackingInterno },
    });
  }

  /** clienteId en el filtro es el control de ownership (igual que Orders: 404, no 403, si no coincide). */
  async findByPedidoIdForClient(pedidoId: string, clienteId: string) {
    return this.prisma.envio.findMany({
      where: {
        pedidoVendedor: { pedidoId, pedido: { clienteId } },
      },
      select: {
        id: true,
        trackingInterno: true,
        estado: true,
        fechaEntregaEstimada: true,
        fechaEntregaReal: true,
        pedidoVendedor: { select: { vendedorId: true } },
      },
    });
  }

  async findClienteByUsuarioId(usuarioId: string) {
    return this.prisma.cliente.findUnique({
      where: { usuarioId },
      select: { id: true, activo: true },
    });
  }

  async findVendedorByUsuarioId(usuarioId: string) {
    return this.prisma.vendedor.findUnique({
      where: { usuarioId },
      select: { id: true, activo: true },
    });
  }

  async findPendingByVendorId(vendedorId: string) {
    return this.prisma.envio.findMany({
      where: {
        estado: EstadoEnvio.PENDIENTE_RECEPCION,
        pedidoVendedor: { vendedorId },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findReceptionQueue(sucursalOrigenId: string) {
    return this.prisma.envio.findMany({
      where: {
        sucursalOrigenId,
        estado: EstadoEnvio.PENDIENTE_RECEPCION,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findDispatchQueue(sucursalOrigenId: string) {
    return this.prisma.envio.findMany({
      where: {
        sucursalOrigenId,
        estado: EstadoEnvio.CLASIFICADO,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Transacción de la confirmación de recepción: crea RecepcionSucursal,
   * mueve el estado con un update condicionado (solo si sigue en
   * PENDIENTE_RECEPCION -- protege contra doble escaneo de la misma guía) y
   * registra el evento de tracking. Devuelve null si el guard no aplicó.
   *
   * `estadoDestino` cubre los tres desenlaces posibles del escaneo. Cuando el
   * recepcionista certifica daño o rechazo, el envío salta directo a su estado
   * terminal: no pasa por RECIBIDO_SUCURSAL porque nunca entra a la red. La
   * RecepcionSucursal se registra igual en los tres casos -- el hecho de que
   * alguien revisó ese paquete en esa sucursal ocurrió.
   */
  async confirmReception(params: ConfirmReceptionParams) {
    return this.prisma.$transaction(async (tx) => {
      const actualizado = await tx.envio.updateMany({
        where: {
          id: params.envioId,
          estado: EstadoEnvio.PENDIENTE_RECEPCION,
        },
        data: {
          estado: params.estadoDestino,
          ...(params.pesoRealKg !== undefined && {
            pesoRealKg: params.pesoRealKg,
            // Sin cálculo volumétrico en v1 (decisión de alcance): el peso
            // cobrable es directamente el peso real medido en báscula.
            pesoCobrableKg: params.pesoRealKg,
          }),
        },
      });

      if (actualizado.count === 0) {
        return null;
      }

      const envio = await tx.envio.findUniqueOrThrow({
        where: { id: params.envioId },
      });

      await tx.recepcionSucursal.create({
        data: {
          envioId: params.envioId,
          sucursalId: envio.sucursalOrigenId,
          empleadoId: params.empleadoId,
          observaciones: params.observaciones,
        },
      });

      await tx.eventoTracking.create({
        data: {
          envioId: params.envioId,
          estado: params.estadoDestino,
          descripcion: describirEstado(
            params.estadoDestino,
            params.observaciones,
          ),
        },
      });

      return envio;
    });
  }

  /**
   * Clasifica el envío y aplica la decisión de ruta del RouteResolver en la
   * misma transacción: RECIBIDO_SUCURSAL -> CLASIFICADO -> (EN_TRANSITO con
   * TransferenciaSucursal, EN_SUCURSAL_DESTINO directo si origen==destino,
   * o se queda en CLASIFICADO si no hay vehículo disponible todavía).
   */
  async classifyAndRoute(params: ClassifyAndRouteParams) {
    return this.prisma.$transaction(async (tx) => {
      const clasificado = await tx.envio.updateMany({
        where: {
          id: params.envioId,
          estado: EstadoEnvio.RECIBIDO_SUCURSAL,
        },
        data: { estado: EstadoEnvio.CLASIFICADO },
      });

      if (clasificado.count === 0) {
        return null;
      }

      await tx.eventoTracking.create({
        data: {
          envioId: params.envioId,
          estado: EstadoEnvio.CLASIFICADO,
          descripcion: DESCRIPCION_POR_ESTADO[EstadoEnvio.CLASIFICADO],
        },
      });

      return this.applyRouteDecision(tx, params);
    });
  }

  /**
   * Reintento manual de la decisión de ruta desde CLASIFICADO (cuando la
   * primera pasada quedó en ESPERAR_VEHICULO) -- no repite la clasificación.
   */
  async applyRouteDecisionFromClassified(params: ClassifyAndRouteParams) {
    return this.prisma.$transaction(async (tx) => {
      const envio = await tx.envio.findUnique({
        where: { id: params.envioId },
      });

      if (!envio || envio.estado !== EstadoEnvio.CLASIFICADO) {
        return null;
      }

      return this.applyRouteDecision(tx, params);
    });
  }

  private async applyRouteDecision(
    tx: Prisma.TransactionClient,
    params: ClassifyAndRouteParams,
  ) {
    const envio = await tx.envio.findUniqueOrThrow({
      where: { id: params.envioId },
    });

    if (params.decision === 'SOLO_CLASIFICAR') {
      // Sin vehículo disponible para la transferencia (ESPERAR_VEHICULO):
      // el envío se queda en CLASIFICADO hasta un reintento manual.
      return envio;
    }

    if (params.decision === 'CREAR_TRANSFERENCIA') {
      if (!params.vehiculoId) {
        throw new Error(
          'vehiculoId es requerido cuando decision es CREAR_TRANSFERENCIA.',
        );
      }

      await tx.transferenciaSucursal.create({
        data: {
          envioId: params.envioId,
          sucursalOrigenId: envio.sucursalOrigenId,
          sucursalDestinoId: envio.sucursalDestinoId,
          vehiculoId: params.vehiculoId,
          fechaSalida: new Date(),
        },
      });

      await tx.envio.update({
        where: { id: params.envioId },
        data: { estado: EstadoEnvio.EN_TRANSITO, fechaDespacho: new Date() },
      });

      await tx.eventoTracking.create({
        data: {
          envioId: params.envioId,
          estado: EstadoEnvio.EN_TRANSITO,
          descripcion: DESCRIPCION_POR_ESTADO[EstadoEnvio.EN_TRANSITO],
        },
      });
    } else {
      await tx.envio.update({
        where: { id: params.envioId },
        data: { estado: EstadoEnvio.EN_SUCURSAL_DESTINO },
      });

      await tx.eventoTracking.create({
        data: {
          envioId: params.envioId,
          estado: EstadoEnvio.EN_SUCURSAL_DESTINO,
          descripcion: DESCRIPCION_POR_ESTADO[EstadoEnvio.EN_SUCURSAL_DESTINO],
        },
      });
    }

    return tx.envio.findUniqueOrThrow({ where: { id: params.envioId } });
  }

  /** Guard: solo aplica si la transferencia aún no tenía fechaLlegada registrada. */
  async confirmTransferArrival(params: ConfirmTransferArrivalParams) {
    return this.prisma.$transaction(async (tx) => {
      const transferenciaActualizada =
        await tx.transferenciaSucursal.updateMany({
          where: { id: params.transferenciaId, fechaLlegada: null },
          data: { fechaLlegada: new Date() },
        });

      if (transferenciaActualizada.count === 0) {
        return null;
      }

      const envioActualizado = await tx.envio.updateMany({
        where: { id: params.envioId, estado: EstadoEnvio.EN_TRANSITO },
        data: { estado: EstadoEnvio.EN_SUCURSAL_DESTINO },
      });

      if (envioActualizado.count === 0) {
        return null;
      }

      await tx.eventoTracking.create({
        data: {
          envioId: params.envioId,
          estado: EstadoEnvio.EN_SUCURSAL_DESTINO,
          descripcion: DESCRIPCION_POR_ESTADO[EstadoEnvio.EN_SUCURSAL_DESTINO],
        },
      });

      return tx.envio.findUniqueOrThrow({ where: { id: params.envioId } });
    });
  }

  async assignDelivery(params: AssignDeliveryParams) {
    return this.prisma.$transaction(async (tx) => {
      const actualizado = await tx.envio.updateMany({
        where: { id: params.envioId, estado: EstadoEnvio.EN_SUCURSAL_DESTINO },
        data: { estado: EstadoEnvio.EN_REPARTO },
      });

      if (actualizado.count === 0) {
        return null;
      }

      await tx.entrega.create({
        data: {
          envioId: params.envioId,
          repartidorId: params.repartidorId,
          fechaAsignacion: new Date(),
        },
      });

      await tx.eventoTracking.create({
        data: {
          envioId: params.envioId,
          estado: EstadoEnvio.EN_REPARTO,
          descripcion: DESCRIPCION_POR_ESTADO[EstadoEnvio.EN_REPARTO],
        },
      });

      return tx.envio.findUniqueOrThrow({ where: { id: params.envioId } });
    });
  }

  async recordDeliveryAttempt(params: RecordDeliveryAttemptParams) {
    return this.prisma.$transaction(async (tx) => {
      const intentosPrevios = await tx.intentoEntrega.count({
        where: { entregaId: params.entregaId },
      });

      await tx.intentoEntrega.create({
        data: {
          entregaId: params.entregaId,
          numeroIntento: intentosPrevios + 1,
          resultado: params.resultado,
          observaciones: params.observaciones,
          fotoIntentoUrl: params.fotoIntentoUrl,
        },
      });

      if (params.esExitoso) {
        await tx.entrega.update({
          where: { id: params.entregaId },
          data: {
            fechaEntrega: new Date(),
            nombreRecibe: params.nombreRecibe,
          },
        });

        await tx.envio.update({
          where: { id: params.envioId },
          data: {
            estado: EstadoEnvio.ENTREGADO,
            fechaEntregaReal: new Date(),
          },
        });

        await tx.eventoTracking.create({
          data: {
            envioId: params.envioId,
            estado: EstadoEnvio.ENTREGADO,
            descripcion: DESCRIPCION_POR_ESTADO[EstadoEnvio.ENTREGADO],
          },
        });
      } else if (params.esDevolucion) {
        await tx.envio.update({
          where: { id: params.envioId },
          data: { estado: EstadoEnvio.DEVUELTO },
        });

        await tx.eventoTracking.create({
          data: {
            envioId: params.envioId,
            estado: EstadoEnvio.DEVUELTO,
            descripcion: DESCRIPCION_POR_ESTADO[EstadoEnvio.DEVUELTO],
          },
        });
      } else {
        await tx.eventoTracking.create({
          data: {
            envioId: params.envioId,
            estado: EstadoEnvio.EN_REPARTO,
            descripcion: `Intento de entrega fallido (${params.resultado}). Se reintentará.`,
          },
        });
      }

      return tx.envio.findUniqueOrThrow({ where: { id: params.envioId } });
    });
  }

  async countDeliveryAttempts(entregaId: string): Promise<number> {
    return this.prisma.intentoEntrega.count({ where: { entregaId } });
  }

  async findByPedidoVendedorId(pedidoVendedorId: string) {
    return this.prisma.envio.findUnique({ where: { pedidoVendedorId } });
  }

  /**
   * Todo lo que ShipmentCreationService necesita para crear un Envio por
   * cada PedidoVendedor de un pedido recién pagado: coordenadas de entrega,
   * coordenadas de operación de cada vendedor, e items agrupables por
   * vendedor (para EnvioItem, sin mezclar productos de otros vendedores).
   */
  async findPaidOrderContext(pedidoId: string) {
    return this.prisma.pedido.findUnique({
      where: { id: pedidoId },
      select: {
        id: true,
        direccionEntrega: {
          select: { latitud: true, longitud: true },
        },
        pedidoVendedores: {
          select: {
            id: true,
            vendedorId: true,
            vendedor: {
              select: {
                estadoOperacion: {
                  select: { latitud: true, longitud: true },
                },
              },
            },
          },
        },
        items: {
          select: {
            id: true,
            vendedorId: true,
            cantidad: true,
          },
        },
      },
    });
  }

  async findTransferById(transferenciaId: string) {
    return this.prisma.transferenciaSucursal.findUnique({
      where: { id: transferenciaId },
    });
  }

  async findEntregaById(entregaId: string) {
    return this.prisma.entrega.findUnique({
      where: { id: entregaId },
      include: {
        envio: { select: { id: true, estado: true, pesoRealKg: true } },
      },
    });
  }
}

export type ShipmentDetailRecord = NonNullable<
  Awaited<ReturnType<ShipmentRepository['findById']>>
>;
