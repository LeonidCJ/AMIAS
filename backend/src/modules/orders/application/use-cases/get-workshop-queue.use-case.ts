import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class GetWorkshopQueueUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    // 1. Fetch active manufacturing orders matching the 4-stage OrderStatus enum
    const orders = await this.prisma.order.findMany({
      where: {
        status: { in: ['CONFIRMED', 'IN_CUTTING', 'DTF_PRINTING', 'READY'] },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                concertEvent: true,
                cut: true,
              },
            },
            size: true,
          },
        },
        paymentReceipt: true,
      },
    });

    const now = new Date().getTime();

    // 2. Flatten order items with concert event date for queue sorting
    const queue = orders.flatMap((order) => {
      return order.items.map((item) => {
        const eventDate = item.product?.concertEvent?.eventDate
          ? new Date(item.product.concertEvent.eventDate)
          : new Date('2099-12-31');

        const diffTime = eventDate.getTime() - now;
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const isUrgent = daysRemaining <= 2 && daysRemaining >= 0; // TR-029: Urgencia < 48H

        return {
          orderId: order.id,
          orderNumber: order.orderNumber,
          orderCreatedAt: order.createdAt,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          orderStatus: order.status,
          itemId: item.id,
          productId: item.productId,
          productName: item.product?.name || 'Prenda Textil',
          concertEventName: item.product?.concertEvent?.name || 'Gira Oficial',
          eventVenue: item.product?.concertEvent?.venue || 'Estadio',
          eventDate: eventDate,
          daysRemaining: daysRemaining,
          isUrgent: isUrgent, // TR-029 Flag < 48H
          cutName: item.product?.cut?.name || 'Jersey Algodón',
          grammageGsm: item.product?.cut?.grammageGsm || 240,
          sizeLabel: item.size?.label || 'M',
          chestCm: item.size?.chestCm,
          lengthCm: item.size?.lengthCm,
          shoulderCm: item.size?.shoulderCm,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
          receiptOperationCode: order.paymentReceipt?.operationCode,
        };
      });
    });

    // 3. TR-028 Sorting Logic: Prioritized by ConcertEvent.eventDate ascending (closest event first)
    queue.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());

    return queue;
  }
}
