import { ConcertEventEntity } from './concert-event.entity';

export const CONCERT_EVENT_REPOSITORY = 'CONCERT_EVENT_REPOSITORY';

export interface ConcertEventRepository {
  save(event: ConcertEventEntity): Promise<ConcertEventEntity>;
  findAllOrderedByDate(): Promise<ConcertEventEntity[]>;
  findById(id: string): Promise<ConcertEventEntity | null>;
}
