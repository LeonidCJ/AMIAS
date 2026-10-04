import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ORDER_REPOSITORY } from './domain/order.repository';
import { PrismaOrderRepository } from './infrastructure/persistence/prisma-order.repository';
import { CreateOrderUseCase } from './application/use-cases/create-order.use-case';
import { GetCustomerProfileAndPatternUseCase } from './application/use-cases/get-customer-profile-and-pattern.use-case';
import { UpdateCustomerPreferencesUseCase } from './application/use-cases/update-customer-preferences.use-case';
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
    GetCustomerProfileAndPatternUseCase,
    UpdateCustomerPreferencesUseCase,
    GetWorkshopQueueUseCase,
    UpdateOrderStatusUseCase,
  ],
  exports: [ORDER_REPOSITORY],
})
export class OrdersModule {}
