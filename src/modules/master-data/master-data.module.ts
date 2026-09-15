import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { TEXTILE_COLOR_REPOSITORY } from './domain/textile-color.repository';
import { TEXTILE_CUT_REPOSITORY } from './domain/textile-cut.repository';
import { TEXTILE_SIZE_REPOSITORY } from './domain/textile-size.repository';
import { PrismaTextileColorRepository } from './infrastructure/persistence/prisma-textile-color.repository';
import { PrismaTextileCutRepository } from './infrastructure/persistence/prisma-textile-cut.repository';
import { PrismaTextileSizeRepository } from './infrastructure/persistence/prisma-textile-size.repository';
import { CreateTextileColorUseCase } from './application/use-cases/create-textile-color.use-case';
import { CreateTextileCutUseCase } from './application/use-cases/create-textile-cut.use-case';
import { CreateTextileSizeUseCase } from './application/use-cases/create-textile-size.use-case';
import { ListMasterDataUseCase } from './application/use-cases/list-master-data.use-case';
import { MasterDataController } from './presentation/master-data.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [MasterDataController],
  providers: [
    {
      provide: TEXTILE_COLOR_REPOSITORY,
      useClass: PrismaTextileColorRepository,
    },
    {
      provide: TEXTILE_CUT_REPOSITORY,
      useClass: PrismaTextileCutRepository,
    },
    {
      provide: TEXTILE_SIZE_REPOSITORY,
      useClass: PrismaTextileSizeRepository,
    },
    CreateTextileColorUseCase,
    CreateTextileCutUseCase,
    CreateTextileSizeUseCase,
    ListMasterDataUseCase,
  ],
})
export class MasterDataModule {}
