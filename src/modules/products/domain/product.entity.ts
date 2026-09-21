import { DomainException } from '../../../core/exceptions/domain.exception';

export interface ProductSizeRelation {
  sizeId: string;
  label?: string;
  chestCm?: number;
  lengthCm?: number;
}

export interface ConcertEventRelation {
  id: string;
  name: string;
  venue: string;
}

export interface TextileCutRelation {
  id: string;
  name: string;
  grammageGsm: number;
}

export class ProductEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly basePrice: number,
    public readonly concertEventId: string,
    public readonly cutId: string,
    public readonly sizeIds: string[],
    public readonly imageUrl: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly concertEvent?: ConcertEventRelation,
    public readonly cut?: TextileCutRelation,
    public readonly sizes?: ProductSizeRelation[],
  ) {
    if (!name || name.trim() === '') {
      throw new DomainException('Product name cannot be empty.');
    }
    if (basePrice <= 0) {
      throw new DomainException(`Invalid product price: ${basePrice}. Price in PEN must be greater than zero.`);
    }
    if (!concertEventId || concertEventId.trim() === '') {
      throw new DomainException('Product must be associated with a valid Concert Event.');
    }
    if (!cutId || cutId.trim() === '') {
      throw new DomainException('Product must be associated with a valid Textile Cut/Silhouette.');
    }
  }
}
