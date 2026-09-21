import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../../domain/product.repository';
import { ProductEntity, ProductSizeRelation } from '../../domain/product.entity';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(product: ProductEntity, sizeIds: string[]): Promise<ProductEntity> {
    const record = await this.prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        concertEventId: product.concertEventId,
        cutId: product.cutId,
        imageUrl: product.imageUrl,
        isActive: product.isActive,
        sizes: {
          create: sizeIds.map((sizeId) => ({
            size: { connect: { id: sizeId } },
          })),
        },
      },
      include: {
        concertEvent: true,
        cut: true,
        sizes: {
          include: {
            size: true,
          },
        },
      },
    });

    return this.toDomain(record);
  }

  async findAllActive(): Promise<ProductEntity[]> {
    const records = await this.prisma.product.findMany({
      where: { isActive: true },
      include: {
        concertEvent: true,
        cut: true,
        sizes: {
          include: {
            size: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => this.toDomain(record));
  }

  async findById(id: string): Promise<ProductEntity | null> {
    const record = await this.prisma.product.findUnique({
      where: { id },
      include: {
        concertEvent: true,
        cut: true,
        sizes: {
          include: {
            size: true,
          },
        },
      },
    });

    if (!record) return null;
    return this.toDomain(record);
  }

  private toDomain(record: any): ProductEntity {
    const sizeRelations: ProductSizeRelation[] = (record.sizes || []).map((ps: any) => ({
      sizeId: ps.sizeId || ps.size?.id,
      label: ps.size?.label,
      chestCm: ps.size?.chestCm,
      lengthCm: ps.size?.lengthCm,
    }));

    return new ProductEntity(
      record.id,
      record.name,
      record.description,
      record.basePrice,
      record.concertEventId,
      record.cutId,
      sizeRelations.map((s) => s.sizeId),
      record.imageUrl,
      record.isActive,
      record.createdAt,
      record.updatedAt,
      record.concertEvent
        ? {
            id: record.concertEvent.id,
            name: record.concertEvent.name,
            venue: record.concertEvent.venue,
          }
        : undefined,
      record.cut
        ? {
            id: record.cut.id,
            name: record.cut.name,
            grammageGsm: record.cut.grammageGsm,
          }
        : undefined,
      sizeRelations,
    );
  }
}
