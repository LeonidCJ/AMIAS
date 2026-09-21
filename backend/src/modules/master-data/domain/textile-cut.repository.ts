import { TextileCutEntity } from './textile-cut.entity';

export const TEXTILE_CUT_REPOSITORY = 'TEXTILE_CUT_REPOSITORY';

export interface TextileCutRepository {
  save(cut: TextileCutEntity): Promise<TextileCutEntity>;
  findAll(): Promise<TextileCutEntity[]>;
}
