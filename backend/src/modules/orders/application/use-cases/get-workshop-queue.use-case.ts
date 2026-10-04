import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class GetWorkshopQueueUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    // 1. Fetch active manufacturing orders (excluding CANCELLED)
    const orders = await this.prisma.order.findMany({
      where: {
        status: { in: ['PAID', 'IN_PRODUCTION', 'PENDING', 'COMPLETED'] },
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

    // 2. Flatten order items with concert event date for queue sorting
    const now = new Date().getTime();

    const queue = orders.flatMap((order) => {
      return order.items.map((item) => {
        const eventDate = item.product?.concertEvent?.eventDate
          ? new Date(item.product.concertEvent.eventDate)
          : new Date('2099-12-31');

        const diffTime = eventDate.getTime() - now;
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          orderStatus: order.status,
          orderCreatedAt: order.createdAt,
          itemId: item.id,
          productName: item.product?.name || 'Prenda Textil',
          concertEventName: item.product?.concertEvent?.name || 'Gira Oficial',
          eventVenue: item.product?.concertEvent?.venue || 'Estadio',
          eventDate: eventDate,
          daysRemaining: daysRemaining,
          cutName: item.product?.cut?.name || 'Jersey Algodón',
          grammageGsm: item.product?.cut?.grammageGsm || 240,
          sizeLabel: item.size?.label || 'M',
          chestCm: item.size?.chestCm,
          lengthCm: item.size?.lengthCm,
          shoulderCm: item.size?.shoulderCm,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          receiptOperationCode: order.paymentReceipt?.operationCode,
        };
      });
    });

    // 3. TR-028 Sorting Logic: Prioritized by ConcertEvent.eventDate ascending (closest event first)
    queue.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());

    return queue;
  }
}
