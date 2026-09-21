import { DomainException } from '../exceptions/domain.exception';

export class VenueCapacity {
  private readonly value: number;

  constructor(value: number) {
    if (value <= 0) {
      throw new DomainException(`Invalid Venue Capacity: ${value}. Capacity must be greater than zero.`);
    }
    this.value = value;
  }

  public getValue(): number {
    return this.value;
  }
}
