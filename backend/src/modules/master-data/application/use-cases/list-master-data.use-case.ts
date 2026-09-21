import { Inject, Injectable } from '@nestjs/common';
import { TEXTILE_COLOR_REPOSITORY, TextileColorRepository } from '../../domain/textile-color.repository';
import { TEXTILE_CUT_REPOSITORY, TextileCutRepository } from '../../domain/textile-cut.repository';
import { TEXTILE_SIZE_REPOSITORY, TextileSizeRepository } from '../../domain/textile-size.repository';

@Injectable()
export class ListMasterDataUseCase {
  constructor(
    @Inject(TEXTILE_COLOR_REPOSITORY)
    private readonly colorRepository: TextileColorRepository,
    @Inject(TEXTILE_CUT_REPOSITORY)
    private readonly cutRepository: TextileCutRepository,
    @Inject(TEXTILE_SIZE_REPOSITORY)
    private readonly sizeRepository: TextileSizeRepository,
  ) {}

  async execute() {
    const [colors, cuts, sizes] = await Promise.all([
      this.colorRepository.findAll(),
      this.cutRepository.findAll(),
      this.sizeRepository.findAll(),
    ]);

    return { colors, cuts, sizes };
  }
}
