import { DomainException } from '../../../core/exceptions/domain.exception';

export enum OrderStatusEnum {
  PENDING = 'PENDING',
  PAID = 'PAID',
  IN_PRODUCTION = 'IN_PRODUCTION',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface OrderItemEntity {
  id?: string;
  productId: string;
  productName?: string;
  sizeId: string;
  sizeLabel?: string;
  quantity: number;
  unitPrice: number;
}

export class OrderEntity {
  constructor(
    public readonly id: string,
    public readonly orderNumber: string, // Immutable #ORD-XXXX format
    public readonly customerName: string,
    public readonly customerPhone: string,
    public readonly totalAmount: number,
    public readonly status: OrderStatusEnum,
    public readonly items: OrderItemEntity[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    if (!customerName || customerName.trim() === '') {
      throw new DomainException('El nombre del cliente es obligatorio.');
    }
    if (!customerPhone || customerPhone.trim() === '') {
      throw new DomainException('El teléfono del cliente es obligatorio.');
    }
    if (!items || items.length === 0) {
      throw new DomainException('La orden debe contener al menos una prenda/ítem.');
    }
    if (totalAmount <= 0) {
      throw new DomainException(`El monto total en Soles (S/) debe ser mayor a cero.`);
    }
  }
}
