import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import { OrderStateMachine } from '../../domain/order-state-machine';

@Injectable()
export class StartProductionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Verify order exists and validate FSM transition to IN_CUTTING (HTTP 400 on invalid state)
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  cut: true,
                },
              },
              size: true,
            },
          },
        },
      });

      if (!order) {
        throw new NotFoundException(`La orden con ID '${orderId}' no fue encontrada.`);
      }

      OrderStateMachine.validateTransition(
        order.status,
        OrderStatus.IN_CUTTING,
        order.orderNumber,
      );

      // 2. Default color for plain fabric stock (Negro Reactive Special)
      const defaultColor = await tx.textileColor.findFirst({
        where: { name: { contains: 'Negro' } },
      });

      const colorId = defaultColor?.id || (await tx.textileColor.findFirst())?.id;

      if (!colorId) {
        throw new UnprocessableEntityException('No hay colores reactivos registrados en el catálogo maestro.');
      }

      // 3. Validate stock availability and execute atomic decrement per SKU
      for (const item of order.items) {
        const cutId = item.product.cutId;
        const sizeId = item.sizeId;

        // Check stock record
        const stock = await tx.inventoryStock.findUnique({
          where: {
            cutId_colorId_sizeId: {
              cutId,
              colorId,
              sizeId,
            },
          },
        });

        const currentQty = stock?.quantity || 0;
        if (currentQty < item.quantity) {
          throw new UnprocessableEntityException(
            `Quiebre de stock: Faltan existencias para Talla ${item.size.label} (${item.product.cut.name}). Disponible: ${currentQty} und, Solicitado: ${item.quantity} und.`,
          );
        }

        // Atomic decrement
        await tx.inventoryStock.update({
          where: {
            cutId_colorId_sizeId: {
              cutId,
              colorId,
              sizeId,
            },
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 4. Update order status to IN_CUTTING
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.IN_CUTTING },
        include: {
          items: {
            include: {
              product: true,
              size: true,
            },
          },
        },
      });

      return updatedOrder;
    });
  }
}
