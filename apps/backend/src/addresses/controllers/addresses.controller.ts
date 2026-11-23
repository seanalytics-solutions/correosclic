import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUserDto } from '../../auth/dto/authenticated-user.dto';

import { AddressesService } from '../application/services/addresses.service';
import { CreateAddressDto } from '../application/dto/create-address.dto';
import { CustomerAddressDto } from '../application/dto/customer-address.dto';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUserDto,
  ): Promise<CustomerAddressDto[]> {
    return this.addressesService.list(user.id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUserDto,
    @Body() dto: CreateAddressDto,
  ): Promise<CustomerAddressDto[]> {
    return this.addressesService.create(user.id, dto);
  }

  @Patch(':id/principal')
  setPrincipal(
    @CurrentUser() user: AuthenticatedUserDto,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CustomerAddressDto[]> {
    return this.addressesService.setPrincipal(user.id, id);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthenticatedUserDto,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CustomerAddressDto[]> {
    return this.addressesService.remove(user.id, id);
  }
}
