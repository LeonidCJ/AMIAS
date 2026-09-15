import { Injectable } from '@nestjs/common';
import { ConcertEventRepository } from '../../domain/concert-event.repository';
import { ConcertEventEntity } from '../../domain/concert-event.entity';
import { PrismaService } from '../../../../prisma/prisma.service';
import { VenueCapacity } from '../../../../core/value-objects/venue-capacity.vo';

@Injectable()
export class PrismaConcertEventRepository implements ConcertEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(event: ConcertEventEntity): Promise<ConcertEventEntity> {
    const record = await this.prisma.concertEvent.create({
      data: {
        name: event.name,
        venue: event.venue,
        capacity: event.capacity.getValue(),
        rate: event.rate,
        eventDate: event.eventDate,
      },
    });
    return this.toDomain(record);
  }

  async findAllOrderedByDate(): Promise<ConcertEventEntity[]> {
    const records = await this.prisma.concertEvent.findMany({
      orderBy: { eventDate: 'asc' },
    });
    return records.map((r) => this.toDomain(r));
  }

  async findById(id: string): Promise<ConcertEventEntity | null> {
    const record = await this.prisma.concertEvent.findUnique({ where: { id } });
    if (!record) return null;
    return this.toDomain(record);
  }

  private toDomain(record: any): ConcertEventEntity {
    return new ConcertEventEntity(
      record.id,
      record.name,
      record.venue,
      new VenueCapacity(record.capacity),
      record.rate,
      record.eventDate,
      record.createdAt,
    );
  }
}
