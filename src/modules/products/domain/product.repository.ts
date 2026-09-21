import { ProductEntity } from './product.entity';

export const PRODUCT_REPOSITORY = 'PRODUCT_REPOSITORY';

export interface ProductRepository {
  save(product: ProductEntity, sizeIds: string[]): Promise<ProductEntity>;
  findAllActive(): Promise<ProductEntity[]>;
  findById(id: string): Promise<ProductEntity | null>;
}
