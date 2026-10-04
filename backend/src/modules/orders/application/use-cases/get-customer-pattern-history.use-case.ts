import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class GetCustomerPatternHistoryUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(customerPhone: string) {
    const cleanPhone = customerPhone.trim();

    // 1. Fetch all orders matching customer's phone number
    const orders = await this.prisma.order.findMany({
      where: { customerPhone: cleanPhone },
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
      orderBy: { createdAt: 'desc' },
    });

    if (!orders || orders.length === 0) {
      throw new NotFoundException(`No se encontraron pedidos registrados para el teléfono '${cleanPhone}'.`);
    }

    // 2. Extract anatomical measurements and preferred cuts history
    const cutFrequencyMap = new Map<string, { cutName: string; grammageGsm: number; count: number }>();
    const sizeHistoryMap = new Map<string, { label: string; chestCm: number; lengthCm: number; shoulderCm: number; heightRef: string | null; count: number }>();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        // Track cut frequency
        if (item.product?.cut) {
          const cutKey = item.product.cut.id;
          const existingCut = cutFrequencyMap.get(cutKey);
          if (existingCut) {
            existingCut.count += item.quantity;
          } else {
            cutFrequencyMap.set(cutKey, {
              cutName: item.product.cut.name,
              grammageGsm: item.product.cut.grammageGsm,
              count: item.quantity,
            });
          }
        }

        // Track size measurements
        if (item.size) {
          const sizeKey = item.size.id;
          const existingSize = sizeHistoryMap.get(sizeKey);
          if (existingSize) {
            existingSize.count += item.quantity;
          } else {
            sizeHistoryMap.set(sizeKey, {
              label: item.size.label,
              chestCm: item.size.chestCm,
              lengthCm: item.size.lengthCm,
              shoulderCm: item.size.shoulderCm,
              heightRef: item.size.heightRef,
              count: item.quantity,
            });
          }
        }
      });
    });

    return {
      customerPhone: cleanPhone,
      customerName: orders[0]?.customerName || 'Cliente AMIAS',
      totalOrdersCount: orders.length,
      preferredCuts: Array.from(cutFrequencyMap.values()).sort((a, b) => b.count - a.count),
      anatomicalMeasurements: Array.from(sizeHistoryMap.values()).sort((a, b) => b.count - a.count),
      ordersHistory: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        totalAmount: o.totalAmount,
        createdAt: o.createdAt,
        items: o.items.map((i) => ({
          id: i.id,
          productName: i.product?.name,
          concertEvent: i.product?.concertEvent?.name,
          cutName: i.product?.cut?.name,
          sizeLabel: i.size?.label,
          chestCm: i.size?.chestCm,
          lengthCm: i.size?.lengthCm,
          shoulderCm: i.size?.shoulderCm,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      })),
    };
  }
}
