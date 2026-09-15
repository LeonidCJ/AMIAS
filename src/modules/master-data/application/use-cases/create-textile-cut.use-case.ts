import { Inject, Injectable } from '@nestjs/common';
import { TEXTILE_CUT_REPOSITORY, TextileCutRepository } from '../../domain/textile-cut.repository';
import { TextileCutEntity } from '../../domain/textile-cut.entity';
import { FabricGsm } from '../../../../core/value-objects/fabric-gsm.vo';

@Injectable()
export class CreateTextileCutUseCase {
  constructor(
    @Inject(TEXTILE_CUT_REPOSITORY)
    private readonly cutRepository: TextileCutRepository,
  ) {}

  async execute(name: string, grammageGsm: number, description?: string): Promise<TextileCutEntity> {
    const gsm = new FabricGsm(grammageGsm);
    const cut = new TextileCutEntity('', name, gsm, description || null, new Date());
    return this.cutRepository.save(cut);
  }
}
