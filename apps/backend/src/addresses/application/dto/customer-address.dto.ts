// NUEVO
export class CustomerAddressDto {
  id: string;
  alias: string | null;
  calle: string;
  numeroExterior: string;
  numeroInterior: string | null;
  colonia: string | null;
  codigoPostal: string;
  ciudad: string;
  estadoProvincia: string;
  referencias: string | null;
  direccionFormateada: string | null;
  esPrincipal: boolean;
}
