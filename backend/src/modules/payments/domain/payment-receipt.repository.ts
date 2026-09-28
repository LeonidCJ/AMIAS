import { PaymentReceiptEntity } from './payment-receipt.entity';

export const PAYMENT_RECEIPT_REPOSITORY = 'PAYMENT_RECEIPT_REPOSITORY';

export interface PaymentReceiptRepository {
  save(receipt: PaymentReceiptEntity): Promise<PaymentReceiptEntity>;
  findByOperationCode(operationCode: string): Promise<PaymentReceiptEntity | null>;
  findByFileHash(fileHash: string): Promise<PaymentReceiptEntity | null>;
  findByOrderId(orderId: string): Promise<PaymentReceiptEntity | null>;
}
