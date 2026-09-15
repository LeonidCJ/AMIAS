import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConcertEventsModule } from './modules/concert-events/concert-events.module';
import { MasterDataModule } from './modules/master-data/master-data.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ConcertEventsModule,
    MasterDataModule,
  ],
})
export class AppModule {}
