import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadReceiptDto } from '../application/dtos/upload-receipt.dto';
import { UploadReceiptUseCase } from '../application/use-cases/upload-receipt.use-case';
import { ParseAndVerifyImageFilePipe } from '../../../core/pipes/parse-and-verify-image-file.pipe';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly uploadReceiptUseCase: UploadReceiptUseCase) {}

  @Post('upload-receipt')
  @UseInterceptors(FileInterceptor('file'))
  async uploadReceipt(
    @UploadedFile(ParseAndVerifyImageFilePipe)
    file: { buffer: Buffer; originalname: string; size: number },
    @Body() dto: UploadReceiptDto,
  ) {
    const receipt = await this.uploadReceiptUseCase.execute(
      file.buffer,
      file.originalname,
      dto.orderId,
      dto.operationCode,
    );

    return {
      message: 'Payment receipt uploaded and verified successfully',
      receipt: {
        id: receipt.id,
        orderId: receipt.orderId,
        operationCode: receipt.operationCode,
        fileHash: receipt.fileHash,
        receiptUrl: receipt.receiptUrl,
        createdAt: receipt.createdAt,
      },
    };
  }
}
