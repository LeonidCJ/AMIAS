import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateTextileColorDto {
  @IsString({ message: 'El nombre del color debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre del color no puede estar vacío.' })
  name!: string;

  @IsString({ message: 'El código hexadecimal debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El código hexadecimal no puede estar vacío.' })
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'El código hexadecimal debe tener un formato de color válido (#RRGGBB).' })
  hexCode!: string;
}
