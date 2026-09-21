import { TextileSizeEntity } from './textile-size.entity';

export const TEXTILE_SIZE_REPOSITORY = 'TEXTILE_SIZE_REPOSITORY';

export interface TextileSizeRepository {
  save(size: TextileSizeEntity): Promise<TextileSizeEntity>;
  findAll(): Promise<TextileSizeEntity[]>;
}
