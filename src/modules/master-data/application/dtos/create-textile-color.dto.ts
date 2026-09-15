import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateTextileColorDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'hexCode must be a valid hex color format (#RRGGBB).' })
  hexCode!: string;
}
