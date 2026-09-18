import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from '../domain/services/password.service';
import { MailerService } from '../domain/services/mailer.service';
import { RegisterResponseDto } from '../dto/register-response.dto';
import { RegisterDto } from '../dto/register.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { PasswordMismatchException } from '../domain/exceptions/password-mismatch.exception';
import { EmailAlreadyExistsException } from '../domain/exceptions/email-already-exists.exception';
import { InvalidOrExpiredResetTokenException } from '../domain/exceptions/invalid-or-expired-reset-token.exception';
import { UserRepository } from '../infrastructure/repositories/user.repository';
import { TokenService } from '../domain/services/token.service';
import { LoginDto } from '../dto/login.dto';

const RESET_TOKEN_EXPIRATION_MINUTES = 15;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly mailerService: MailerService,
  ) {}

  async ping() {
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      module: 'auth',
      database: 'connected',
    };
  }
  //validar contraseña y confirmacion de contraseña, si no coinciden lanzar excepcion
  async register(
    dto: RegisterDto,
  ): Promise<RegisterResponseDto> {
    if (dto.password !== dto.confirmPassword) {
      throw new PasswordMismatchException();
    }
    //Buscar si el correo electrónico ya existe en la base de datos, si existe lanzar excepcion
    const existingUser = await this.userRepository.findByEmail(
      dto.email,
    );

    if (existingUser) {
      throw new EmailAlreadyExistsException();
    }
    //hashear la contraseña usando el servicio de password
    const passwordHash = await this.passwordService.hash(dto.password);

    const user = await this.userRepository.registerClient({
      email: dto.email,
      passwordHash,
      nombre: dto.nombre,
      apellidoPaterno: dto.apellidoPaterno,
      apellidoMaterno: dto.apellidoMaterno,
      telefono: dto.telefono,
    });
    const accessToken = await this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
    });
    const roles = await this.userRepository.getRoles(user.id);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellidoPaterno: user.apellidoPaterno,
        apellidoMaterno: user.apellidoMaterno ?? undefined,
        roles,
      },
    };
  }
  async login(dto: LoginDto) {
    const user = await this.userRepository.findByEmailWithRoles(dto.email);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const validPassword = await this.passwordService.compare(
      dto.password,
      user.passwordHash,
    );

    if (!validPassword) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const accessToken = await this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellidoPaterno: user.apellidoPaterno,
        apellidoMaterno: user.apellidoMaterno ?? undefined,
        roles: user.usuarioRoles.map((ur) => ur.rol.codigo),
      },
    };
  }

  // --- Nuevo: forgot-password / reset-password ---

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    // Respuesta genérica siempre igual, exista o no el correo,
    // para no permitir enumeración de usuarios registrados.
    const genericResponse = {
      message:
        'Si el correo está registrado, recibirás un enlace de recuperación en breve.',
    };

    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      return genericResponse;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');
    const expiresAt = new Date(
      Date.now() + RESET_TOKEN_EXPIRATION_MINUTES * 60 * 1000,
    );

    await this.userRepository.setResetPasswordToken(
      user.id,
      tokenHash,
      expiresAt,
    );

    // El token en texto plano solo se envía por correo, nunca se guarda así.
    await this.mailerService.sendPasswordResetEmail({
      to: user.email,
      resetToken: rawToken,
      nombre: user.nombre,
    });

    return genericResponse;
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    if (dto.password !== dto.confirmPassword) {
      throw new PasswordMismatchException();
    }

    const tokenHash = crypto
      .createHash('sha256')
      .update(dto.token)
      .digest('hex');

    const user =
      await this.userRepository.findByValidResetPasswordTokenHash(tokenHash);

    if (!user) {
      throw new InvalidOrExpiredResetTokenException();
    }

    const passwordHash = await this.passwordService.hash(dto.password);
    await this.userRepository.resetPassword(user.id, passwordHash);

    return { message: 'Contraseña actualizada correctamente.' };
  }
}
