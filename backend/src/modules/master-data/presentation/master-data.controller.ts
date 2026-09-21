import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateTextileColorDto } from '../application/dtos/create-textile-color.dto';
import { CreateTextileCutDto } from '../application/dtos/create-textile-cut.dto';
import { CreateTextileSizeDto } from '../application/dtos/create-textile-size.dto';
import { CreateTextileColorUseCase } from '../application/use-cases/create-textile-color.use-case';
import { CreateTextileCutUseCase } from '../application/use-cases/create-textile-cut.use-case';
import { CreateTextileSizeUseCase } from '../application/use-cases/create-textile-size.use-case';
import { ListMasterDataUseCase } from '../application/use-cases/list-master-data.use-case';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator';
import { UserRole } from '../../auth/domain/user.entity';

@Controller('master-data')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MasterDataController {
  constructor(
    private readonly createColorUseCase: CreateTextileColorUseCase,
    private readonly createCutUseCase: CreateTextileCutUseCase,
    private readonly createSizeUseCase: CreateTextileSizeUseCase,
    private readonly listMasterDataUseCase: ListMasterDataUseCase,
  ) {}

  @Post('colors')
  @Roles(UserRole.ADMIN)
  async createColor(@Body() dto: CreateTextileColorDto) {
    const color = await this.createColorUseCase.execute(dto.name, dto.hexCode);
    return {
      message: 'Textile color created successfully',
      color: {
        id: color.id,
        name: color.name,
        hexCode: color.hexCode.getValue(),
        createdAt: color.createdAt,
      },
    };
  }

  @Post('cuts')
  @Roles(UserRole.ADMIN)
  async createCut(@Body() dto: CreateTextileCutDto) {
    const cut = await this.createCutUseCase.execute(dto.name, dto.grammageGsm, dto.description);
    return {
      message: 'Textile cut created successfully',
      cut: {
        id: cut.id,
        name: cut.name,
        grammageGsm: cut.grammageGsm.getValue(),
        description: cut.description,
        createdAt: cut.createdAt,
      },
    };
  }

  @Post('sizes')
  @Roles(UserRole.ADMIN)
  async createSize(@Body() dto: CreateTextileSizeDto) {
    const size = await this.createSizeUseCase.execute(
      dto.label,
      dto.chestCm,
      dto.lengthCm,
      dto.shoulderCm,
      dto.heightRef,
    );
    return {
      message: 'Textile size created successfully',
      size: {
        id: size.id,
        label: size.label,
        chestCm: size.chestCm,
        lengthCm: size.lengthCm,
        shoulderCm: size.shoulderCm,
        heightRef: size.heightRef,
        createdAt: size.createdAt,
      },
    };
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OPERARIO)
  async findAll() {
    const data = await this.listMasterDataUseCase.execute();
    return {
      colors: data.colors.map((c) => ({
        id: c.id,
        name: c.name,
        hexCode: c.hexCode.getValue(),
        createdAt: c.createdAt,
      })),
      cuts: data.cuts.map((cu) => ({
        id: cu.id,
        name: cu.name,
        grammageGsm: cu.grammageGsm.getValue(),
        description: cu.description,
        createdAt: cu.createdAt,
      })),
      sizes: data.sizes.map((s) => ({
        id: s.id,
        label: s.label,
        chestCm: s.chestCm,
        lengthCm: s.lengthCm,
        shoulderCm: s.shoulderCm,
        heightRef: s.heightRef,
        createdAt: s.createdAt,
      })),
    };
  }
}
