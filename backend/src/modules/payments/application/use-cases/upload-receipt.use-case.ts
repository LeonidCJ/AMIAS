import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PAYMENT_RECEIPT_REPOSITORY, PaymentReceiptRepository } from '../../domain/payment-receipt.repository';
import { PaymentReceiptEntity } from '../../domain/payment-receipt.entity';
import { PrismaService } from '../../../../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class UploadReceiptUseCase {
  constructor(
    @Inject(PAYMENT_RECEIPT_REPOSITORY)
    private readonly paymentReceiptRepository: PaymentReceiptRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    fileBuffer: Buffer,
    fileName: string,
    orderId: string,
    operationCode: string,
  ): Promise<PaymentReceiptEntity> {
    // 1. Verify order exists in DB
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`La orden con ID '${orderId}' no fue encontrada.`);
    }

    // 2. TR-024: Calculate in-memory SHA-256 cryptographic hash from file buffer
    const fileHash = crypto.createHash('sha256').update(fileBuffer as unknown as Uint8Array).digest('hex');

    // 3. TR-025: Check duplicate operation code or file hash in DB
    const [existingCode, existingHash] = await Promise.all([
      this.paymentReceiptRepository.findByOperationCode(operationCode.trim()),
      this.paymentReceiptRepository.findByFileHash(fileHash),
    ]);

    if (existingCode || existingHash) {
      throw new ConflictException('El comprobante o código de operación ya ha sido registrado previamente.');
    }

    // 4. Simulated receipt storage URL (e.g. /uploads/receipts or Cloudinary)
    const receiptUrl = `/uploads/receipts/${Date.now()}_${fileName}`;

    // 5. Persist receipt and update Order status to CONFIRMED
    const receiptEntity = new PaymentReceiptEntity(
      '',
      orderId,
      operationCode.trim(),
      fileHash,
      receiptUrl,
      new Date(),
    );

    const savedReceipt = await this.paymentReceiptRepository.save(receiptEntity);

    // Update order status to CONFIRMED
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CONFIRMED },
    });

    return savedReceipt;
  }
}
