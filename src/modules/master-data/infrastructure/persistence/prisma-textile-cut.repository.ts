import { Injectable } from '@nestjs/common';
import { TextileCutRepository } from '../../domain/textile-cut.repository';
import { TextileCutEntity } from '../../domain/textile-cut.entity';
import { PrismaService } from '../../../../prisma/prisma.service';
import { FabricGsm } from '../../../../core/value-objects/fabric-gsm.vo';

@Injectable()
export class PrismaTextileCutRepository implements TextileCutRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(cut: TextileCutEntity): Promise<TextileCutEntity> {
    const record = await this.prisma.textileCut.create({
      data: {
        name: cut.name,
        grammageGsm: cut.grammageGsm.getValue(),
        description: cut.description,
      },
    });
    return new TextileCutEntity(record.id, record.name, new FabricGsm(record.grammageGsm), record.description, record.createdAt);
  }

  async findAll(): Promise<TextileCutEntity[]> {
    const records = await this.prisma.textileCut.findMany({ orderBy: { createdAt: 'desc' } });
    return records.map(
      (r) => new TextileCutEntity(r.id, r.name, new FabricGsm(r.grammageGsm), r.description, r.createdAt),
    );
  }
}
