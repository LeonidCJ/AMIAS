import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

/**
 * Máquina de Estados Finita (FSM) para el flujo de confección en Taller AMIAS (Semana 9).
 *
 * Flujo estricto lineal de taller:
 * PENDING_PAYMENT -> CONFIRMED -> IN_CUTTING -> DTF_PRINTING -> READY -> COMPLETED
 *
 * Regla de bloqueo operativo (HTTP 400):
 * - La cancelación (CANCELLED) solo se permite antes de ingresar a mesa de corte (PENDING_PAYMENT o CONFIRMED).
 * - Una vez en estado de corte (IN_CUTTING) o posterior, cualquier intento de cancelación,
 *   retroceso o salto de etapa es rechazado con HTTP 400 Bad Request.
 */
export class OrderStateMachine {
  private static readonly ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.CONFIRMED]: [OrderStatus.IN_CUTTING, OrderStatus.CANCELLED],
    [OrderStatus.IN_CUTTING]: [OrderStatus.DTF_PRINTING],
    [OrderStatus.DTF_PRINTING]: [OrderStatus.READY],
    [OrderStatus.READY]: [OrderStatus.COMPLETED],
    [OrderStatus.COMPLETED]: [],
    [OrderStatus.CANCELLED]: [],
  };

  private static readonly STAGE_LABELS: Record<OrderStatus, string> = {
    [OrderStatus.CONFIRMED]: '1. Confirmado (CONFIRMED)',
    [OrderStatus.IN_CUTTING]: '2. En Mesa de Corte (IN_CUTTING)',
    [OrderStatus.DTF_PRINTING]: '3. Estampado Térmico DTF (DTF_PRINTING)',
    [OrderStatus.READY]: '4. Listo para Entrega (READY)',
    [OrderStatus.COMPLETED]: 'Entregado / Finalizado (COMPLETED)',
    [OrderStatus.CANCELLED]: 'Cancelado (CANCELLED)',
  };

  public static canTransition(currentStatus: OrderStatus, targetStatus: OrderStatus): boolean {
    const allowed = this.ALLOWED_TRANSITIONS[currentStatus] || [];
    return allowed.includes(targetStatus);
  }

  public static getAllowedTransitions(currentStatus: OrderStatus): OrderStatus[] {
    return this.ALLOWED_TRANSITIONS[currentStatus] || [];
  }

  public static validateTransition(
    currentStatus: OrderStatus,
    targetStatus: OrderStatus,
    orderNumber?: string,
  ): void {
    const orderRef = orderNumber ? ` ${orderNumber}` : '';

    if (!targetStatus || !(targetStatus in this.ALLOWED_TRANSITIONS)) {
      throw new BadRequestException(
        `Estado de destino '${targetStatus}' no es un estado válido de la Máquina de Estados (FSM) del taller.`,
      );
    }

    // Regla específica de bloqueo HTTP 400 para pedidos en estado de corte (IN_CUTTING) o superior
    const lockedCuttingStates: OrderStatus[] = [
      OrderStatus.IN_CUTTING,
      OrderStatus.DTF_PRINTING,
      OrderStatus.READY,
      OrderStatus.COMPLETED,
    ];

    if (
      lockedCuttingStates.includes(currentStatus) &&
      (targetStatus === OrderStatus.CANCELLED ||
        targetStatus === OrderStatus.CONFIRMED)
    ) {
      throw new BadRequestException(
        `Bloqueo Operativo de Taller (HTTP 400): El pedido${orderRef} ya se encuentra en '${this.STAGE_LABELS[currentStatus]}'. Una vez cortada la tela en mesa de corte, no se permite cancelar ni retroceder la orden.`,
      );
    }

    if (!this.canTransition(currentStatus, targetStatus)) {
      const allowedList = this.getAllowedTransitions(currentStatus);
      const allowedText =
        allowedList.length > 0
          ? allowedList.map((s) => this.STAGE_LABELS[s] || s).join(' o ')
          : 'Ninguna (Estado Terminal)';

      throw new BadRequestException(
        `Transición FSM inválida (HTTP 400) para el pedido${orderRef}: No se puede pasar de '${this.STAGE_LABELS[currentStatus]}' a '${this.STAGE_LABELS[targetStatus]}'. Transición permitida: ${allowedText}.`,
      );
    }
  }
}
