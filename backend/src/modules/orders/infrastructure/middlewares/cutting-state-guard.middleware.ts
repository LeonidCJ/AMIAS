import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { OrderStateMachine } from '../../domain/order-state-machine';

/**
 * Middleware de intercepción HTTP 400 para pedidos en estado de corte (Semana 9).
 *
 * Intercepta peticiones de mutación de estado o inicio de confección:
 * - PATCH /orders/:id/status
 * - POST /workshop/orders/:orderId/start-production
 *
 * Si el pedido ya ingresó a mesa de corte (IN_CUTTING o etapa posterior) y se intenta
 * cancelar, retroceder o ejecutar una transición inválida según la FSM, bloquea la
 * petición con HTTP 400 BadRequestException antes de llegar al controlador.
 */
@Injectable()
export class CuttingStateGuardMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const orderId = req.params.id || req.params.orderId;
    if (!orderId) {
      return next();
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, orderNumber: true, status: true },
    });

    if (!order) {
      return next();
    }

    // 1. Intercepción en POST /workshop/orders/:orderId/start-production
    if (req.method === 'POST' && req.originalUrl.includes('start-production')) {
      if (order.status === OrderStatus.IN_CUTTING) {
        throw new BadRequestException(
          `Bloqueo Operativo de Taller (HTTP 400): El pedido ${order.orderNumber} ya se encuentra en estado de corte (IN_CUTTING) y su stock ya fue descontado.`,
        );
      }

      OrderStateMachine.validateTransition(
        order.status,
        OrderStatus.IN_CUTTING,
        order.orderNumber,
      );
      return next();
    }

    // 2. Intercepción en PATCH /orders/:id/status
    if (req.method === 'PATCH' && req.body && 'status' in req.body) {
      const targetStatus = req.body.status as OrderStatus;
      OrderStateMachine.validateTransition(
        order.status,
        targetStatus,
        order.orderNumber,
      );
    }

    return next();
  }
}
