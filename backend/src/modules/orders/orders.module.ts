import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ORDER_REPOSITORY } from './domain/order.repository';
import { PrismaOrderRepository } from './infrastructure/persistence/prisma-order.repository';
import { CreateOrderUseCase } from './application/use-cases/create-order.use-case';
import { OrdersController } from './presentation/orders.controller';

@Module({
  imports: [PrismaModule],
  controllers: [OrdersController],
  providers: [
    {
      provide: ORDER_REPOSITORY,
      useClass: PrismaOrderRepository,
    },
    CreateOrderUseCase,
  ],
  exports: [ORDER_REPOSITORY],
})
export class OrdersModule {}
