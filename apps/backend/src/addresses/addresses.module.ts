// NUEVO
import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

import { AddressesController } from './controllers/addresses.controller';
import { AddressesService } from './application/services/addresses.service';
import { AddressesRepository } from './infrastructure/repositories/addresses.repository';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AddressesController],
  providers: [AddressesService, AddressesRepository],
})
export class AddressesModule {}
