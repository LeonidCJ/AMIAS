import { Inject, Injectable } from '@nestjs/common';
import { TEXTILE_COLOR_REPOSITORY, TextileColorRepository } from '../../domain/textile-color.repository';
import { TextileColorEntity } from '../../domain/textile-color.entity';
import { HexColor } from '../../../../core/value-objects/hex-color.vo';

@Injectable()
export class CreateTextileColorUseCase {
  constructor(
    @Inject(TEXTILE_COLOR_REPOSITORY)
    private readonly colorRepository: TextileColorRepository,
  ) {}

  async execute(name: string, hexCode: string): Promise<TextileColorEntity> {
    const hex = new HexColor(hexCode);
    const color = new TextileColorEntity('', name, hex, new Date());
    return this.colorRepository.save(color);
  }
}
