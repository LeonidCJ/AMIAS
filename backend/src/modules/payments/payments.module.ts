import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PAYMENT_RECEIPT_REPOSITORY } from './domain/payment-receipt.repository';
import { PrismaPaymentReceiptRepository } from './infrastructure/persistence/prisma-payment-receipt.repository';
import { UploadReceiptUseCase } from './application/use-cases/upload-receipt.use-case';
import { PaymentsController } from './presentation/payments.controller';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentsController],
  providers: [
    {
      provide: PAYMENT_RECEIPT_REPOSITORY,
      useClass: PrismaPaymentReceiptRepository,
    },
    UploadReceiptUseCase,
  ],
  exports: [PAYMENT_RECEIPT_REPOSITORY],
})
export class PaymentsModule {}
