import { OrderEntity } from './order.entity';

export const ORDER_REPOSITORY = 'ORDER_REPOSITORY';

export interface OrderRepository {
  save(orderData: {
    customerName: string;
    customerPhone: string;
    totalAmount: number;
    items: { productId: string; sizeId: string; quantity: number; unitPrice: number }[];
  }): Promise<OrderEntity>;
  findById(id: string): Promise<OrderEntity | null>;
  findByOrderNumber(orderNumber: string): Promise<OrderEntity | null>;
}
