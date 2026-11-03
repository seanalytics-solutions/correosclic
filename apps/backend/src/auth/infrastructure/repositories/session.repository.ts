import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

type CreateSessionData = {
  usuarioId: string;
  refreshTokenHash: string;
  expiraAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
};

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSessionData) {
    return this.prisma.sesion.create({
      data: {
        usuarioId: data.usuarioId,
        refreshTokenHash: data.refreshTokenHash,
        expiraAt: data.expiraAt,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  async findByRefreshTokenHash(refreshTokenHash: string) {
    return this.prisma.sesion.findFirst({
      where: {
        refreshTokenHash,
      },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            activo: true,
            deletedAt: true,
          },
        },
      },
    });
  }

  // Revoca la sesión actual y crea la nueva en una sola transacción.
  // Devuelve null si la sesión ya había sido revocada (por ejemplo, por un
  // refresh simultáneo con el mismo token), para que el service decida.
  async rotate(sessionId: string, newSession: CreateSessionData) {
    return this.prisma.$transaction(async (tx) => {
      const revoked = await tx.sesion.updateMany({
        where: {
          id: sessionId,
          revocadaAt: null,
        },
        data: {
          revocadaAt: new Date(),
        },
      });

      if (revoked.count === 0) {
        return null;
      }

      return tx.sesion.create({
        data: {
          usuarioId: newSession.usuarioId,
          refreshTokenHash: newSession.refreshTokenHash,
          expiraAt: newSession.expiraAt,
          ipAddress: newSession.ipAddress,
          userAgent: newSession.userAgent,
        },
      });
    });
  }

  async revoke(sessionId: string) {
    return this.prisma.sesion.updateMany({
      where: {
        id: sessionId,
        revocadaAt: null,
      },
      data: {
        revocadaAt: new Date(),
      },
    });
  }

  async revokeAllByUserId(usuarioId: string) {
    return this.prisma.sesion.updateMany({
      where: {
        usuarioId,
        revocadaAt: null,
      },
      data: {
        revocadaAt: new Date(),
      },
    });
  }
}
