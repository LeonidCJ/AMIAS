import { Inject, Injectable } from '@nestjs/common';
import { CONCERT_EVENT_REPOSITORY, ConcertEventRepository } from '../../domain/concert-event.repository';
import { ConcertEventEntity } from '../../domain/concert-event.entity';

@Injectable()
export class ListActiveEventsUseCase {
  constructor(
    @Inject(CONCERT_EVENT_REPOSITORY)
    private readonly concertEventRepository: ConcertEventRepository,
  ) {}

  async execute(): Promise<ConcertEventEntity[]> {
    return this.concertEventRepository.findAllOrderedByDate();
  }
}
