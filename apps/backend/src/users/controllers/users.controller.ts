// NUEVO: perfil del usuario de la sesión (/api/users/me). El id sale del token.
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUserDto } from '../../auth/dto/authenticated-user.dto';

import { UsersService } from '../application/services/users.service';
import { UpdateMeDto } from '../application/dto/update-me.dto';
import { ChangePasswordDto } from '../application/dto/change-password.dto';
import { UserProfileDto } from '../application/dto/user-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(
    @CurrentUser() user: AuthenticatedUserDto,
  ): Promise<UserProfileDto> {
    return this.usersService.getMe(user.id);
  }

  @Patch('me')
  updateMe(
    @CurrentUser() user: AuthenticatedUserDto,
    @Body() dto: UpdateMeDto,
  ): Promise<UserProfileDto> {
    return this.usersService.updateMe(user.id, dto);
  }

  /** 200 y no 201: no se crea nada, se cambia un dato. */
  @Post('me/password')
  @HttpCode(200)
  changePassword(
    @CurrentUser() user: AuthenticatedUserDto,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.usersService.changePassword(user.id, dto);
  }
}
