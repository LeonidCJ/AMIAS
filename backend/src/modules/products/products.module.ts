import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PRODUCT_REPOSITORY } from './domain/product.repository';
import { PrismaProductRepository } from './infrastructure/persistence/prisma-product.repository';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { ListActiveProductsUseCase } from './application/use-cases/list-active-products.use-case';
import { ProductsController } from './presentation/products.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ProductsController],
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
    CreateProductUseCase,
    ListActiveProductsUseCase,
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductsModule {}
