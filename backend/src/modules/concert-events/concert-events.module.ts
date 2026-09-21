import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { CONCERT_EVENT_REPOSITORY } from './domain/concert-event.repository';
import { PrismaConcertEventRepository } from './infrastructure/persistence/prisma-concert-event.repository';
import { CreateConcertEventUseCase } from './application/use-cases/create-concert-event.use-case';
import { ListActiveEventsUseCase } from './application/use-cases/list-active-events.use-case';
import { ConcertEventsController } from './presentation/concert-events.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ConcertEventsController],
  providers: [
    {
      provide: CONCERT_EVENT_REPOSITORY,
      useClass: PrismaConcertEventRepository,
    },
    CreateConcertEventUseCase,
    ListActiveEventsUseCase,
  ],
})
export class ConcertEventsModule {}
