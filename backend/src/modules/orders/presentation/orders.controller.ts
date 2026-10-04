import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateOrderDto } from '../application/dtos/create-order.dto';
import { CreateOrderUseCase } from '../application/use-cases/create-order.use-case';
import { GetCustomerPatternHistoryUseCase } from '../application/use-cases/get-customer-pattern-history.use-case';
import { GetWorkshopQueueUseCase } from '../application/use-cases/get-workshop-queue.use-case';
import { UpdateOrderStatusUseCase } from '../application/use-cases/update-order-status.use-case';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator';
import { UserRole } from '../../auth/domain/user.entity';
import { OrderStatus } from '@prisma/client';

@Controller()
export class OrdersController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly getCustomerPatternHistoryUseCase: GetCustomerPatternHistoryUseCase,
    private readonly getWorkshopQueueUseCase: GetWorkshopQueueUseCase,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
  ) {}

  @Post('orders/checkout')
  async checkout(@Body() dto: CreateOrderDto) {
    const order = await this.createOrderUseCase.execute(dto);
    return {
      message: 'Order created successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        totalAmount: order.totalAmount,
        status: order.status,
        items: order.items,
        createdAt: order.createdAt,
      },
    };
  }

  // TR-027: Customer Pattern History & Order Tracker Self-Service
  @Get('customers/:customerPhone/pattern-history')
  async getCustomerPatternHistory(@Param('customerPhone') customerPhone: string) {
    return this.getCustomerPatternHistoryUseCase.execute(customerPhone);
  }

  // TR-028: Workshop Queue Prioritized by Concert Event Proximity (ADMIN / OPERARIO)
  @Get('workshop/queue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERARIO)
  async getWorkshopQueue() {
    return this.getWorkshopQueueUseCase.execute();
  }

  // Operator status advancement (ADMIN / OPERARIO)
  @Patch('orders/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERARIO)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    const order = await this.updateOrderStatusUseCase.execute(id, status);
    return {
      message: 'Order status updated successfully',
      order,
    };
  }
}
