import { IsNotEmpty, IsString, IsInt, Min, IsOptional } from 'class-validator';

export class CreateTextileCutDto {
  @IsString({ message: 'El nombre del corte debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre del corte no puede estar vacío.' })
  name!: string;

  @IsInt({ message: 'El gramaje debe ser un número entero.' })
  @Min(50, { message: 'El gramaje GSM debe ser de al menos 50g.' })
  grammageGsm!: number;

  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  @IsOptional()
  description?: string;
}
