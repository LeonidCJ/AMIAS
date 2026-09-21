import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateProductDto } from '../application/dtos/create-product.dto';
import { CreateProductUseCase } from '../application/use-cases/create-product.use-case';
import { ListActiveProductsUseCase } from '../application/use-cases/list-active-products.use-case';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator';
import { UserRole } from '../../auth/domain/user.entity';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly listActiveProductsUseCase: ListActiveProductsUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateProductDto) {
    const product = await this.createProductUseCase.execute(dto);
    return {
      message: 'Product published successfully',
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        concertEventId: product.concertEventId,
        cutId: product.cutId,
        imageUrl: product.imageUrl,
        isActive: product.isActive,
        createdAt: product.createdAt,
        concertEvent: product.concertEvent,
        cut: product.cut,
        sizes: product.sizes,
      },
    };
  }

  @Get()
  async findAll() {
    const products = await this.listActiveProductsUseCase.execute();
    return products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      basePrice: product.basePrice,
      concertEventId: product.concertEventId,
      cutId: product.cutId,
      imageUrl: product.imageUrl,
      isActive: product.isActive,
      createdAt: product.createdAt,
      concertEvent: product.concertEvent,
      cut: product.cut,
      sizes: product.sizes,
    }));
  }
}
