import { Injectable } from '@nestjs/common';
import { TextileColorRepository } from '../../domain/textile-color.repository';
import { TextileColorEntity } from '../../domain/textile-color.entity';
import { PrismaService } from '../../../../prisma/prisma.service';
import { HexColor } from '../../../../core/value-objects/hex-color.vo';

@Injectable()
export class PrismaTextileColorRepository implements TextileColorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(color: TextileColorEntity): Promise<TextileColorEntity> {
    const record = await this.prisma.textileColor.create({
      data: {
        name: color.name,
        hexCode: color.hexCode.getValue(),
      },
    });
    return new TextileColorEntity(record.id, record.name, new HexColor(record.hexCode), record.createdAt);
  }

  async findAll(): Promise<TextileColorEntity[]> {
    const records = await this.prisma.textileColor.findMany({ orderBy: { createdAt: 'desc' } });
    return records.map((r) => new TextileColorEntity(r.id, r.name, new HexColor(r.hexCode), r.createdAt));
  }
}
