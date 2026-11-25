// NUEVO: lógica del perfil propio (módulo users)
import { Injectable } from '@nestjs/common';

import { PasswordService } from '../../../auth/domain/services/password.service';
import { UsersRepository } from '../../infrastructure/repositories/users.repository';

import { UpdateMeDto } from '../dto/update-me.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UserProfileDto } from '../dto/user-profile.dto';

import { InvalidCurrentPasswordException } from '../../domain/exceptions/invalid-current-password.exception';
import { PasswordNotSetException } from '../../domain/exceptions/password-not-set.exception';
import { SamePasswordException } from '../../domain/exceptions/same-password.exception';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordService: PasswordService,
  ) {}

  /** Perfil del usuario de la sesión. */
  async getMe(userId: string): Promise<UserProfileDto> {
    const user = await this.usersRepository.findProfileById(userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    return UserProfileDto.fromRecord(user);
  }

  /** Edita nombre, apellidos y teléfono. Solo cambia lo que venga en el DTO. */
  async updateMe(userId: string, dto: UpdateMeDto): Promise<UserProfileDto> {
    // Asegura que el usuario siga activo antes de editar
    await this.getMe(userId);

    const user = await this.usersRepository.updateProfile(userId, {
      nombre: dto.nombre,
      apellidoPaterno: dto.apellidoPaterno,
      apellidoMaterno: dto.apellidoMaterno,
      telefono: dto.telefono,
    });

    return UserProfileDto.fromRecord(user);
  }

  /** Cambia la contraseña comprobando la actual. Mismo cifrado que el login. */
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.usersRepository.findPasswordHashById(userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    if (!user.passwordHash) {
      throw new PasswordNotSetException();
    }

    const actualCorrecta = await this.passwordService.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!actualCorrecta) {
      throw new InvalidCurrentPasswordException();
    }

    const esLaMisma = await this.passwordService.compare(
      dto.newPassword,
      user.passwordHash,
    );

    if (esLaMisma) {
      throw new SamePasswordException();
    }

    const passwordHash = await this.passwordService.hash(dto.newPassword);
    await this.usersRepository.updatePasswordHash(userId, passwordHash);

    return { message: 'Contraseña actualizada correctamente.' };
  }
}