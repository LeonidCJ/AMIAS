import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConcertEventsModule } from './modules/concert-events/concert-events.module';
import { MasterDataModule } from './modules/master-data/master-data.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ConcertEventsModule,
    MasterDataModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
  ],
})
export class AppModule {}
