import { Inject, Injectable } from '@nestjs/common';
import { ORDER_REPOSITORY, OrderRepository } from '../../domain/order.repository';
import { OrderEntity } from '../../domain/order.entity';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { PrismaService } from '../../../../prisma/prisma.service';
import { DomainException } from '../../../../core/exceptions/domain.exception';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: CreateOrderDto): Promise<OrderEntity> {
    // 1. Fetch products and official sizes to validate IDs and get base prices securely
    const productIds = dto.items.map((i) => i.productId);
    const [products, allSizes] = await Promise.all([
      this.prisma.product.findMany({
        where: { id: { in: productIds } },
      }),
      this.prisma.textileSize.findMany(),
    ]);

    const productMap = new Map(products.map((p) => [p.id, p]));
    const sizeByIdMap = new Map(allSizes.map((s) => [s.id, s]));
    const sizeByLabelMap = new Map(allSizes.map((s) => [s.label.toUpperCase(), s]));

    // 2. Build items with verified unit prices, resolved sizeId, and calculate total PEN
    let totalAmount = 0;
    const itemsData = dto.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new DomainException(`El producto con ID '${item.productId}' no existe o ya no está disponible.`);
      }

      // Resolve sizeId by UUID or fallback label (e.g., 'size-l' -> 'L')
      let resolvedSize = sizeByIdMap.get(item.sizeId);
      if (!resolvedSize) {
        const cleanedLabel = item.sizeId.replace(/^size-/i, '').toUpperCase();
        resolvedSize = sizeByLabelMap.get(cleanedLabel);
      }
      if (!resolvedSize) {
        throw new DomainException(`La talla seleccionada ('${item.sizeId}') no existe en el catálogo maestro.`);
      }

      const unitPrice = product.basePrice;
      totalAmount += unitPrice * item.quantity;

      return {
        productId: item.productId,
        sizeId: resolvedSize.id,
        quantity: item.quantity,
        unitPrice,
      };
    });

    // 3. Save order using transaction in repository
    return this.orderRepository.save({
      customerName: dto.customerName.trim(),
      customerPhone: dto.customerPhone.trim(),
      totalAmount,
      items: itemsData,
    });
  }
}
