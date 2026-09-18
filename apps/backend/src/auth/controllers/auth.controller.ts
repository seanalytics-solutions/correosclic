import { Body, Controller, Get, Post } from '@nestjs/common';

import { AuthService } from '../application/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';

type ResetPasswordDto = Parameters<AuthService['resetPassword']>[0];

import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthenticatedUserDto } from '../dto/authenticated-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

@UseGuards(JwtAuthGuard)
@Get('ping')
  ping(@CurrentUser() user: AuthenticatedUserDto) {
    return user;
}

  @Post('register')
  async register(@Body() dto: RegisterDto
) {
  return this.authService.register(dto);
}

@Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
}

@Post('forgot-password')
async forgotPassword(
  @Body() dto: ForgotPasswordDto,
) {
  return this.authService.forgotPassword(dto);
}

@Post('reset-password')
async resetPassword(
  @Body() dto: ResetPasswordDto,
) {
  return this.authService.resetPassword(dto);
}
}
