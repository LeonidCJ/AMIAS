import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(orderId: string, status: OrderStatus) {
    const existing = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!existing) {
      throw new NotFoundException(`La orden con ID '${orderId}' no fue encontrada.`);
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
            size: true,
          },
        },
      },
    });

    return updated;
  }
}
