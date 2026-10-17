import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class ReplenishStockDto {
  @IsString({ message: 'El ID del corte debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El ID del corte es obligatorio.' })
  cutId!: string;

  @IsString({ message: 'El ID del color debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El ID del color es obligatorio.' })
  colorId!: string;

  @IsString({ message: 'El ID de la talla debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El ID de la talla es obligatorio.' })
  sizeId!: string;

  @IsInt({ message: 'La cantidad debe ser un número entero.' })
  @Min(1, { message: 'La cantidad a ingresar debe ser de al menos 1 unidad.' })
  quantity!: number;
}
