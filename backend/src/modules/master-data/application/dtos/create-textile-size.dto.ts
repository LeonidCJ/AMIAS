import { IsNotEmpty, IsString, IsInt, Min, IsOptional } from 'class-validator';

export class CreateTextileSizeDto {
  @IsString({ message: 'La etiqueta de la talla debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La etiqueta de la talla no puede estar vacía.' })
  label!: string;

  @IsInt({ message: 'El ancho de pecho en cm debe ser un número entero.' })
  @Min(1, { message: 'El ancho de pecho en cm debe ser mayor a 0.' })
  chestCm!: number;

  @IsInt({ message: 'El largo total en cm debe ser un número entero.' })
  @Min(1, { message: 'El largo total en cm debe ser mayor a 0.' })
  lengthCm!: number;

  @IsInt({ message: 'El ancho de hombro en cm debe ser un número entero.' })
  @Min(1, { message: 'El ancho de hombro en cm debe ser mayor a 0.' })
  shoulderCm!: number;

  @IsString({ message: 'La referencia de altura debe ser una cadena de texto.' })
  @IsOptional()
  heightRef?: string;
}
