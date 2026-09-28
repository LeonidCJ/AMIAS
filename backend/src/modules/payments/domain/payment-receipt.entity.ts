import { DomainException } from '../../../core/exceptions/domain.exception';

export class PaymentReceiptEntity {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly operationCode: string,
    public readonly fileHash: string,
    public readonly receiptUrl: string,
    public readonly createdAt: Date,
  ) {
    if (!orderId || orderId.trim() === '') {
      throw new DomainException('El ID de la orden es obligatorio.');
    }
    if (!operationCode || operationCode.trim() === '') {
      throw new DomainException('El código de operación del voucher es obligatorio.');
    }
    if (!fileHash || fileHash.trim() === '') {
      throw new DomainException('El hash criptográfico SHA-256 del comprobante es obligatorio.');
    }
  }
}
