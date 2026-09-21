import { Inject, Injectable } from '@nestjs/common';
import { PRODUCT_REPOSITORY, ProductRepository } from '../../domain/product.repository';
import { ProductEntity } from '../../domain/product.entity';
import { CreateProductDto } from '../dtos/create-product.dto';

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(dto: CreateProductDto): Promise<ProductEntity> {
    const product = new ProductEntity(
      '',
      dto.name,
      dto.description || null,
      dto.basePrice,
      dto.concertEventId,
      dto.cutId,
      dto.sizeIds,
      dto.imageUrl || null,
      true,
      new Date(),
      new Date(),
    );

    return this.productRepository.save(product, dto.sizeIds);
  }
}
