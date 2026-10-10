import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class GetArtPresignedUrlUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(orderId: string, itemId: string) {
    const item = await this.prisma.orderItem.findUnique({
      where: { id: itemId },
      include: {
        product: {
          include: {
            concertEvent: true,
            cut: true,
          },
        },
        order: true,
      },
    });

    if (!item || item.orderId !== orderId) {
      throw new NotFoundException(`El ítem de orden '${itemId}' no fue encontrado.`);
    }

    // Generate secure HMAC token with 15 minutes expiration (900 seconds)
    const expiresAt = Date.now() + 15 * 60 * 1000;
    const secret = process.env.JWT_ACCESS_SECRET || 'amias_art_secret_key';
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}:${itemId}:${expiresAt}`)
      .digest('hex');

    // High-resolution DTF artwork URL (300 DPI vector/PNG)
    const artFileName = `${item.product.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_dtf_300dpi.png`;
    const presignedUrl = `https://res.cloudinary.com/amias/image/upload/v1/dtf_arts/${artFileName}?expires=${expiresAt}&signature=${signature}`;

    return {
      orderNumber: item.order.orderNumber,
      productName: item.product.name,
      concertEventName: item.product.concertEvent?.name,
      artFileName,
      resolutionDpi: 300,
      format: 'PNG / PDF Vector',
      expiresInSeconds: 900,
      expiresAtISO: new Date(expiresAt).toISOString(),
      presignedUrl,
    };
  }
}
