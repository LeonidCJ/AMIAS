import { Injectable } from '@nestjs/common';
import { PaymentReceiptRepository } from '../../domain/payment-receipt.repository';
import { PaymentReceiptEntity } from '../../domain/payment-receipt.entity';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class PrismaPaymentReceiptRepository implements PaymentReceiptRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(receipt: PaymentReceiptEntity): Promise<PaymentReceiptEntity> {
    const record = await this.prisma.paymentReceipt.create({
      data: {
        orderId: receipt.orderId,
        operationCode: receipt.operationCode,
        fileHash: receipt.fileHash,
        receiptUrl: receipt.receiptUrl,
      },
    });
    return this.toDomain(record);
  }

  async findByOperationCode(operationCode: string): Promise<PaymentReceiptEntity | null> {
    const record = await this.prisma.paymentReceipt.findUnique({ where: { operationCode } });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByFileHash(fileHash: string): Promise<PaymentReceiptEntity | null> {
    const record = await this.prisma.paymentReceipt.findUnique({ where: { fileHash } });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByOrderId(orderId: string): Promise<PaymentReceiptEntity | null> {
    const record = await this.prisma.paymentReceipt.findUnique({ where: { orderId } });
    if (!record) return null;
    return this.toDomain(record);
  }

  private toDomain(record: any): PaymentReceiptEntity {
    return new PaymentReceiptEntity(
      record.id,
      record.orderId,
      record.operationCode,
      record.fileHash,
      record.receiptUrl,
      record.createdAt,
    );
  }
}
