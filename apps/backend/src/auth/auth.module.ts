import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { SessionService } from './domain/services/session.service';
import { SessionRepository } from './infrastructure/repositories/session.repository';
import { ACCESS_TOKEN_EXPIRES_IN } from './constants/auth.constants';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './application/auth.service';

import { PasswordService } from './domain/services/password.service';
import { BcryptPasswordService } from './domain/services/bcrypt-password.service';
import { UserRepository } from './infrastructure/repositories/user.repository';

import { JwtTokenService } from './domain/services/jwt-token.service';
import { TokenService } from './domain/services/token.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MailerModule } from './domain/services/mailer.module';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    MailerModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: ACCESS_TOKEN_EXPIRES_IN,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    SessionRepository,
    SessionService,
    JwtStrategy,
    {
      provide: PasswordService,
      useClass: BcryptPasswordService,
    },
    {
      provide: TokenService,
      useClass: JwtTokenService,
    },
  ],
  exports: [AuthService, UserRepository],
})
export class AuthModule {}
