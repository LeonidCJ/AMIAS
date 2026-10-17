import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class ReplenishStockUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cutId: string, colorId: string, sizeId: string, quantity: number) {
    const [cut, color, size] = await Promise.all([
      this.prisma.textileCut.findUnique({ where: { id: cutId } }),
      this.prisma.textileColor.findUnique({ where: { id: colorId } }),
      this.prisma.textileSize.findUnique({ where: { id: sizeId } }),
    ]);

    if (!cut || !color || !size) {
      throw new NotFoundException('El corte, color o talla especificado no existe.');
    }

    const stock = await this.prisma.inventoryStock.upsert({
      where: {
        cutId_colorId_sizeId: { cutId, colorId, sizeId },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        cutId,
        colorId,
        sizeId,
        quantity,
      },
      include: {
        cut: true,
        color: true,
        size: true,
      },
    });

    return stock;
  }
}
