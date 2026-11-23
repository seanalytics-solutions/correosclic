// NUEVO: consultas de Prisma para el perfil del usuario (módulo users)
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

/** Campos públicos del perfil. Nunca incluye passwordHash ni los datos del reset. */
const PROFILE_SELECT = {
  id: true,
  email: true,
  nombre: true,
  apellidoPaterno: true,
  apellidoMaterno: true,
  telefono: true,
  emailVerificado: true,
  createdAt: true,
} as const;

export type UserProfileRecord = Awaited<
  ReturnType<UsersRepository['findProfileById']>
>;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Perfil de un usuario activo. null si no existe o fue dado de baja. */
  async findProfileById(userId: string) {
    return this.prisma.usuario.findFirst({
      where: { id: userId, activo: true, deletedAt: null },
      select: PROFILE_SELECT,
    });
  }

  /** Edita nombre, apellidos y teléfono. Los campos undefined no se tocan. */
  async updateProfile(
    userId: string,
    data: {
      nombre?: string;
      apellidoPaterno?: string;
      apellidoMaterno?: string | null;
      telefono?: string | null;
    },
  ) {
    return this.prisma.usuario.update({
      where: { id: userId },
      data,
      select: PROFILE_SELECT,
    });
  }

  /** Solo el hash, para comprobar la contraseña actual. */
  async findPasswordHashById(userId: string) {
    return this.prisma.usuario.findFirst({
      where: { id: userId, activo: true, deletedAt: null },
      select: { id: true, passwordHash: true },
    });
  }

  async updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.usuario.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }
}
