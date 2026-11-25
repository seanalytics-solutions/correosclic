// NUEVO: respuesta de GET y PATCH /api/users/me
import type { UserProfileRecord } from '../../infrastructure/repositories/users.repository';

export class UserProfileDto {
  id!: string;
  email!: string;
  nombre!: string;
  apellidoPaterno!: string;
  apellidoMaterno!: string | null;
  telefono!: string | null;
  emailVerificado!: boolean;
  createdAt!: Date;

  static fromRecord(record: NonNullable<UserProfileRecord>): UserProfileDto {
    return {
      id: record.id,
      email: record.email,
      nombre: record.nombre,
      apellidoPaterno: record.apellidoPaterno,
      apellidoMaterno: record.apellidoMaterno,
      telefono: record.telefono,
      emailVerificado: record.emailVerificado,
      createdAt: record.createdAt,
    };
  }
}