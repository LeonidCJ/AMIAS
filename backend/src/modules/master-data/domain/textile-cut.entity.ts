import { FabricGsm } from '../../../core/value-objects/fabric-gsm.vo';
import { DomainException } from '../../../core/exceptions/domain.exception';

export class TextileCutEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly grammageGsm: FabricGsm,
    public readonly description: string | null,
    public readonly createdAt: Date,
  ) {
    if (!name || name.trim() === '') {
      throw new DomainException('Textile cut name cannot be empty.');
    }
  }
}
