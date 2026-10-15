import { GeoCoordinates } from '../../../shared/geo/haversine-distance.calculator';

export interface ShippingCalculationItem {
  vendedorId: string;
  nombreTienda: string;
  estadoOperacion: GeoCoordinates;
  pesoKg: number;
  cantidad: number;
  largoCm?: number;
  anchoCm?: number;
  altoCm?: number;
}

export interface VendorShippingQuote {
  vendedorId: string;
  nombreTienda: string;
  pesoKg: number;
  distanciaKm: number;
  zonaTarifariaCodigo: string;
  tarifa: number;
  esTarifaBase: boolean;
  recargoAplicado?: number;
}

export interface ShippingCalculationResult {
  costoEnvio: number;
  cotizacionesPorVendedor: VendorShippingQuote[];
}
