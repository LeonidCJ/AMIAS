import { DomainException } from '../exceptions/domain.exception';

export class FabricGsm {
  private readonly value: number;

  constructor(value: number) {
    if (value < 50 || value > 500) {
      throw new DomainException(`Invalid Fabric GSM: ${value}. Must be between 50 and 500 gsm.`);
    }
    this.value = value;
  }

  public getValue(): number {
    return this.value;
  }
}
