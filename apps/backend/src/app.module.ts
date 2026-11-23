import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { SellerModule } from './seller/seller.module';
import { AdminModule } from './admin/admin.module';
import { CatalogsModule } from './catalogs/catalogs.module';
import { StorageModule } from './storage/storage.module';
import { ShoppingCartModule } from './shoppping-cart/shopping-cart.module';
import { CheckoutModule } from './checkout/checkout.module';
import { OrdersModule } from './orders/orders.module';
import { IdempotencyModule } from './idempotency/idempotency.module';
import { PaymentsModule } from './payments/payments.module';
import { LogisticsModule } from './logistics/logistics.module';
import { AddressesModule } from './addresses/addresses.module'; // Nuevo

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    IdempotencyModule,
    HealthModule,
    AuthModule,
    CatalogModule,
    SellerModule,
    AdminModule,
    CatalogsModule,
    StorageModule,
    ShoppingCartModule,
    CheckoutModule,
    OrdersModule,
    PaymentsModule,
    LogisticsModule,
    AddressesModule,
  ],
})
export class AppModule {}