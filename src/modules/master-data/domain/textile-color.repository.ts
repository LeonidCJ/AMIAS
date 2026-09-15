import { TextileColorEntity } from './textile-color.entity';

export const TEXTILE_COLOR_REPOSITORY = 'TEXTILE_COLOR_REPOSITORY';

export interface TextileColorRepository {
  save(color: TextileColorEntity): Promise<TextileColorEntity>;
  findAll(): Promise<TextileColorEntity[]>;
}
