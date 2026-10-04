import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

export interface UpdateCustomerPreferencesDto {
  customerName?: string;
  preferredCutId?: string;
  preferredSizeId?: string;
  deliveryAddress?: string;
  deliveryDistrict?: string;
  deliveryReference?: string;
}

@Injectable()
export class UpdateCustomerPreferencesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(identifier: string, dto: UpdateCustomerPreferencesDto) {
    const cleanId = identifier.trim();

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { customerPhone: cleanId },
          { email: cleanId },
        ],
      },
    });

    if (!user) {
      throw new NotFoundException(`No se encontró ningún usuario registrado para '${cleanId}'.`);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        ...(dto.customerName ? { customerName: dto.customerName.trim() } : {}),
        ...(dto.preferredCutId ? { preferredCutId: dto.preferredCutId } : {}),
        ...(dto.preferredSizeId ? { preferredSizeId: dto.preferredSizeId } : {}),
        ...(dto.deliveryAddress ? { deliveryAddress: dto.deliveryAddress.trim() } : {}),
        ...(dto.deliveryDistrict ? { deliveryDistrict: dto.deliveryDistrict.trim() } : {}),
        ...(dto.deliveryReference ? { deliveryReference: dto.deliveryReference.trim() } : {}),
      },
      include: {
        preferredCut: true,
        preferredSize: true,
      },
    });

    return updatedUser;
  }
}
