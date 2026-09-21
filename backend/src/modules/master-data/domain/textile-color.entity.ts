import { HexColor } from '../../../core/value-objects/hex-color.vo';
import { DomainException } from '../../../core/exceptions/domain.exception';

export class TextileColorEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly hexCode: HexColor,
    public readonly createdAt: Date,
  ) {
    if (!name || name.trim() === '') {
      throw new DomainException('Textile color name cannot be empty.');
    }
  }
}
