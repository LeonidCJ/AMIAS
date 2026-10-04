import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ORDER_REPOSITORY } from './domain/order.repository';
import { PrismaOrderRepository } from './infrastructure/persistence/prisma-order.repository';
import { CreateOrderUseCase } from './application/use-cases/create-order.use-case';
import { GetCustomerPatternHistoryUseCase } from './application/use-cases/get-customer-pattern-history.use-case';
import { GetWorkshopQueueUseCase } from './application/use-cases/get-workshop-queue.use-case';
import { UpdateOrderStatusUseCase } from './application/use-cases/update-order-status.use-case';
import { OrdersController } from './presentation/orders.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [OrdersController],
  providers: [
    {
      provide: ORDER_REPOSITORY,
      useClass: PrismaOrderRepository,
    },
    CreateOrderUseCase,
    GetCustomerPatternHistoryUseCase,
    GetWorkshopQueueUseCase,
    UpdateOrderStatusUseCase,
  ],
  exports: [ORDER_REPOSITORY],
})
export class OrdersModule {}
