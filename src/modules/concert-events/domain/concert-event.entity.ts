import { VenueCapacity } from '../../../core/value-objects/venue-capacity.vo';
import { DomainException } from '../../../core/exceptions/domain.exception';

export class ConcertEventEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly venue: string,
    public readonly capacity: VenueCapacity,
    public readonly rate: number,
    public readonly eventDate: Date,
    public readonly createdAt: Date,
  ) {
    if (!name || name.trim() === '') {
      throw new DomainException('Concert event name cannot be empty.');
    }
    if (!venue || venue.trim() === '') {
      throw new DomainException('Concert venue cannot be empty.');
    }
  }
}
