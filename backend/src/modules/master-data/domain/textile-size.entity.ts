import { DomainException } from '../../../core/exceptions/domain.exception';

export class TextileSizeEntity {
  constructor(
    public readonly id: string,
    public readonly label: string,
    public readonly chestCm: number,
    public readonly lengthCm: number,
    public readonly shoulderCm: number,
    public readonly heightRef: string | null,
    public readonly createdAt: Date,
  ) {
    if (!label || label.trim() === '') {
      throw new DomainException('Size label cannot be empty.');
    }
    if (chestCm <= 0 || lengthCm <= 0 || shoulderCm <= 0) {
      throw new DomainException('Size dimensions in cm must be greater than zero.');
    }
  }
}
