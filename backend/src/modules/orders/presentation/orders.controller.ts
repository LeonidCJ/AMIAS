import { Body, Controller, Post } from '@nestjs/common';
import { CreateOrderDto } from '../application/dtos/create-order.dto';
import { CreateOrderUseCase } from '../application/use-cases/create-order.use-case';

@Controller('orders')
export class OrdersController {
  constructor(private readonly createOrderUseCase: CreateOrderUseCase) {}

  @Post('checkout')
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
}
