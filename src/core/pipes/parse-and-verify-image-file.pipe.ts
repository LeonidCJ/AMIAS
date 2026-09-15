import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseAndVerifyImageFilePipe implements PipeTransform {
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];

  async transform(file: { buffer: Buffer; originalname: string; size: number }) {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file provided or file buffer is empty.');
    }

    const { fileTypeFromBuffer } = await import('file-type');
    const detectedType = await fileTypeFromBuffer(file.buffer);

    if (!detectedType || !this.allowedMimeTypes.includes(detectedType.mime)) {
      throw new BadRequestException(
        `Invalid file binary signature (Magic Bytes). Detected type '${detectedType?.mime || 'unknown'}' is not allowed. Only JPEG, PNG, and PDF are accepted.`
      );
    }

    return file;
  }
}
