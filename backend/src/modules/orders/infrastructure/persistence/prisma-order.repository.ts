import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../../domain/order.repository';
import { OrderEntity, OrderStatusEnum, OrderItemEntity } from '../../domain/order.entity';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(orderData: {
    customerName: string;
    customerPhone: string;
    totalAmount: number;
    items: { productId: string; sizeId: string; quantity: number; unitPrice: number }[];
  }): Promise<OrderEntity> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Calculate sequential padded order number e.g. #ORD-0001
      const count = await tx.order.count();
      const nextSequence = count + 1;
      const paddedNumber = String(nextSequence).padStart(4, '0');
      const orderNumber = `#ORD-${paddedNumber}`;

      // 2. Create order record
      const record = await tx.order.create({
        data: {
          orderNumber,
          customerName: orderData.customerName,
          customerPhone: orderData.customerPhone,
          totalAmount: orderData.totalAmount,
          status: OrderStatusEnum.PENDING,
          items: {
            create: orderData.items.map((item) => ({
              productId: item.productId,
              sizeId: item.sizeId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
              size: true,
            },
          },
        },
      });

      return this.toDomain(record);
    });
  }

  async findById(id: string): Promise<OrderEntity | null> {
    const record = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            size: true,
          },
        },
      },
    });

    if (!record) return null;
    return this.toDomain(record);
  }

  async findByOrderNumber(orderNumber: string): Promise<OrderEntity | null> {
    const record = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: true,
            size: true,
          },
        },
      },
    });

    if (!record) return null;
    return this.toDomain(record);
  }

  private toDomain(record: any): OrderEntity {
    const items: OrderItemEntity[] = (record.items || []).map((i: any) => ({
      id: i.id,
      productId: i.productId,
      productName: i.product?.name,
      sizeId: i.sizeId,
      sizeLabel: i.size?.label,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    }));

    return new OrderEntity(
      record.id,
      record.orderNumber,
      record.customerName,
      record.customerPhone,
      record.totalAmount,
      record.status as OrderStatusEnum,
      items,
      record.createdAt,
      record.updatedAt,
    );
  }
}
