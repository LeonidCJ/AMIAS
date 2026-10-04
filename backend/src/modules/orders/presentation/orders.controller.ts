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
import { GetCustomerProfileAndPatternUseCase } from '../application/use-cases/get-customer-profile-and-pattern.use-case';
import { UpdateCustomerPreferencesDto, UpdateCustomerPreferencesUseCase } from '../application/use-cases/update-customer-preferences.use-case';
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
    private readonly getCustomerProfileAndPatternUseCase: GetCustomerProfileAndPatternUseCase,
    private readonly updateCustomerPreferencesUseCase: UpdateCustomerPreferencesUseCase,
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

  // TR-027: Customer Profile & Pattern History (by userId or phone)
  @Get('customers/:identifier/profile-and-pattern')
  async getCustomerProfileAndPattern(@Param('identifier') identifier: string) {
    return this.getCustomerProfileAndPatternUseCase.execute(identifier);
  }

  // TR-027: Update Customer Preferred Cut / Size / Address
  @Patch('customers/:identifier/preferences')
  async updateCustomerPreferences(
    @Param('identifier') identifier: string,
    @Body() dto: UpdateCustomerPreferencesDto,
  ) {
    const updated = await this.updateCustomerPreferencesUseCase.execute(identifier, dto);
    return {
      message: 'Customer preferences updated successfully',
      user: updated,
    };
  }

  // TR-028: Workshop Priority Queue (ADMIN / OPERARIO)
  @Get('workshop/priority-queue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERARIO)
  async getWorkshopPriorityQueue() {
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
