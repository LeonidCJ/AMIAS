import { Injectable } from '@nestjs/common';
import { TextileSizeRepository } from '../../domain/textile-size.repository';
import { TextileSizeEntity } from '../../domain/textile-size.entity';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class PrismaTextileSizeRepository implements TextileSizeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(size: TextileSizeEntity): Promise<TextileSizeEntity> {
    const record = await this.prisma.textileSize.create({
      data: {
        label: size.label,
        chestCm: size.chestCm,
        lengthCm: size.lengthCm,
        shoulderCm: size.shoulderCm,
        heightRef: size.heightRef,
      },
    });
    return new TextileSizeEntity(
      record.id,
      record.label,
      record.chestCm,
      record.lengthCm,
      record.shoulderCm,
      record.heightRef,
      record.createdAt,
    );
  }

  async findAll(): Promise<TextileSizeEntity[]> {
    const records = await this.prisma.textileSize.findMany({ orderBy: { createdAt: 'desc' } });
    return records.map(
      (r) =>
        new TextileSizeEntity(
          r.id,
          r.label,
          r.chestCm,
          r.lengthCm,
          r.shoulderCm,
          r.heightRef,
          r.createdAt,
        ),
    );
  }
}
