import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

import { REFRESH_TOKEN_EXPIRATION_DAYS } from '../../constants/auth.constants';
import { InvalidRefreshTokenException } from '../exceptions/invalid-refresh-token.exception';
import { SessionRepository } from '../../infrastructure/repositories/session.repository';

type SessionMetadata = {
  ipAddress?: string | null;
  userAgent?: string | null;
};

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  // Crea una sesión nueva y devuelve el refresh token en texto plano.
  // En la base de datos solo se guarda su hash, igual que el token de reset-password.
  async createSession(
    usuarioId: string,
    metadata: SessionMetadata = {},
  ): Promise<string> {
    const { rawToken, tokenHash } = this.generateRefreshToken();

    await this.sessionRepository.create({
      usuarioId,
      refreshTokenHash: tokenHash,
      expiraAt: this.buildExpirationDate(),
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });

    return rawToken;
  }

  async rotateSession(
    refreshToken: string,
    metadata: SessionMetadata = {},
  ): Promise<{ userId: string; email: string; refreshToken: string }> {
    const session = await this.sessionRepository.findByRefreshTokenHash(
      this.hashToken(refreshToken),
    );

    if (!session) {
      throw new InvalidRefreshTokenException();
    }

    // Reúso de un token ya rotado o revocado: posible robo.
    // Se revocan todas las sesiones del usuario por seguridad.
    if (session.revocadaAt) {
      await this.sessionRepository.revokeAllByUserId(session.usuarioId);
      throw new InvalidRefreshTokenException();
    }

    if (session.expiraAt <= new Date()) {
      throw new InvalidRefreshTokenException();
    }

    if (!session.usuario.activo || session.usuario.deletedAt) {
      await this.sessionRepository.revoke(session.id);
      throw new InvalidRefreshTokenException();
    }

    const { rawToken, tokenHash } = this.generateRefreshToken();

    const newSession = await this.sessionRepository.rotate(session.id, {
      usuarioId: session.usuarioId,
      refreshTokenHash: tokenHash,
      expiraAt: this.buildExpirationDate(),
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });

    // Otra petición simultánea con el mismo token ganó la rotación.
    if (!newSession) {
      throw new InvalidRefreshTokenException();
    }

    return {
      userId: session.usuario.id,
      email: session.usuario.email,
      refreshToken: rawToken,
    };
  }

  // Logout idempotente: si el token no existe o ya estaba revocado,
  // no se lanza error, para no revelar información.
  async revokeSession(refreshToken: string): Promise<void> {
    const session = await this.sessionRepository.findByRefreshTokenHash(
      this.hashToken(refreshToken),
    );

    if (!session) {
      return;
    }

    await this.sessionRepository.revoke(session.id);
  }

  private generateRefreshToken() {
    const rawToken = crypto.randomBytes(32).toString('hex');

    return {
      rawToken,
      tokenHash: this.hashToken(rawToken),
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private buildExpirationDate(): Date {
    return new Date(
      Date.now() + REFRESH_TOKEN_EXPIRATION_DAYS * 24 * 60 * 60 * 1000,
    );
  }
}
