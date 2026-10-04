import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class GetCustomerProfileAndPatternUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(identifier: string) {
    const cleanId = identifier.trim();

    // 1. Check if user exists by ID or email or phone
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { customerPhone: cleanId },
          { email: cleanId },
        ],
      },
      include: {
        preferredCut: true,
        preferredSize: true,
      },
    });

    const phoneFilter = user?.customerPhone || cleanId;
    const userIdFilter = user?.id;

    // 2. Fetch all orders matching user or phone number
    const orders = await this.prisma.order.findMany({
      where: {
        OR: [
          ...(userIdFilter ? [{ userId: userIdFilter }] : []),
          { customerPhone: phoneFilter },
        ],
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
      orderBy: { createdAt: 'desc' },
    });

    if (!user && orders.length === 0) {
      throw new NotFoundException(`No se encontró perfil ni historial registrado para '${cleanId}'.`);
    }

    // Active order (first non-completed order or latest order)
    const activeOrder = orders.find((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED') || orders[0] || null;
    const completedOrders = orders.filter((o) => o.status === 'COMPLETED');

    // Anatomical measurements summary
    const sizeHistoryMap = new Map<string, { id: string; label: string; chestCm: number; lengthCm: number; shoulderCm: number; count: number }>();
    const cutHistoryMap = new Map<string, { id: string; name: string; grammageGsm: number; count: number }>();

    orders.forEach((o) => {
      o.items.forEach((item) => {
        if (item.size) {
          const sKey = item.size.id;
          const existing = sizeHistoryMap.get(sKey);
          if (existing) {
            existing.count += item.quantity;
          } else {
            sizeHistoryMap.set(sKey, {
              id: item.size.id,
              label: item.size.label,
              chestCm: item.size.chestCm,
              lengthCm: item.size.lengthCm,
              shoulderCm: item.size.shoulderCm,
              count: item.quantity,
            });
          }
        }

        if (item.product?.cut) {
          const cKey = item.product.cut.id;
          const existingCut = cutHistoryMap.get(cKey);
          if (existingCut) {
            existingCut.count += item.quantity;
          } else {
            cutHistoryMap.set(cKey, {
              id: item.product.cut.id,
              name: item.product.cut.name,
              grammageGsm: item.product.cut.grammageGsm,
              count: item.quantity,
            });
          }
        }
      });
    });

    return {
      profile: {
        id: user?.id || null,
        customerName: user?.customerName || orders[0]?.customerName || 'Cliente AMIAS',
        customerPhone: user?.customerPhone || phoneFilter,
        email: user?.email || '',
        preferredCut: user?.preferredCut || null,
        preferredSize: user?.preferredSize || null,
        deliveryAddress: user?.deliveryAddress || '',
        deliveryDistrict: user?.deliveryDistrict || '',
        deliveryReference: user?.deliveryReference || '',
      },
      activeOrder: activeOrder
        ? {
            id: activeOrder.id,
            orderNumber: activeOrder.orderNumber,
            status: activeOrder.status,
            totalAmount: activeOrder.totalAmount,
            createdAt: activeOrder.createdAt,
            items: activeOrder.items.map((i) => ({
              productName: i.product?.name,
              concertEventName: i.product?.concertEvent?.name,
              eventVenue: i.product?.concertEvent?.venue,
              eventDate: i.product?.concertEvent?.eventDate,
              cutName: i.product?.cut?.name,
              grammageGsm: i.product?.cut?.grammageGsm,
              sizeLabel: i.size?.label,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
            })),
          }
        : null,
      anatomicalMeasurements: Array.from(sizeHistoryMap.values()),
      preferredCuts: Array.from(cutHistoryMap.values()),
      completedOrdersHistory: completedOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        totalAmount: o.totalAmount,
        createdAt: o.createdAt,
        items: o.items.map((i) => ({
          productName: i.product?.name,
          sizeLabel: i.size?.label,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      })),
    };
  }
}
