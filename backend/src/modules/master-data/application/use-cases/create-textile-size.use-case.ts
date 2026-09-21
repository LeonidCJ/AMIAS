import { Inject, Injectable } from '@nestjs/common';
import { TEXTILE_SIZE_REPOSITORY, TextileSizeRepository } from '../../domain/textile-size.repository';
import { TextileSizeEntity } from '../../domain/textile-size.entity';

@Injectable()
export class CreateTextileSizeUseCase {
  constructor(
    @Inject(TEXTILE_SIZE_REPOSITORY)
    private readonly sizeRepository: TextileSizeRepository,
  ) {}

  async execute(label: string, chestCm: number, lengthCm: number, shoulderCm: number, heightRef?: string): Promise<TextileSizeEntity> {
    const size = new TextileSizeEntity('', label, chestCm, lengthCm, shoulderCm, heightRef || null, new Date());
    return this.sizeRepository.save(size);
  }
}
