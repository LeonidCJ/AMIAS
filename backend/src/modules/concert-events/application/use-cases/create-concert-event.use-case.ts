import { Inject, Injectable } from '@nestjs/common';
import { CONCERT_EVENT_REPOSITORY, ConcertEventRepository } from '../../domain/concert-event.repository';
import { ConcertEventEntity } from '../../domain/concert-event.entity';
import { VenueCapacity } from '../../../../core/value-objects/venue-capacity.vo';

@Injectable()
export class CreateConcertEventUseCase {
  constructor(
    @Inject(CONCERT_EVENT_REPOSITORY)
    private readonly concertEventRepository: ConcertEventRepository,
  ) {}

  async execute(name: string, venue: string, capacity: number, rate: number, eventDate: Date): Promise<ConcertEventEntity> {
    const venueCapacity = new VenueCapacity(capacity);
    const event = new ConcertEventEntity(
      '',
      name,
      venue,
      venueCapacity,
      rate || 0.004,
      eventDate,
      new Date(),
    );
    return this.concertEventRepository.save(event);
  }
}
