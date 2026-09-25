import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ArrayMinSize } from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'El nombre de la prenda debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre de la prenda no puede estar vacío.' })
  name!: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  @IsOptional()
  description?: string;

  @IsNumber({}, { message: 'El precio base debe ser un número válido.' })
  @Min(0.01, { message: 'El precio base en Soles (S/ PEN) debe ser mayor a 0.' })
  basePrice!: number;

  @IsString({ message: 'El ID del concierto/gira debe ser un identificador válido.' })
  @IsNotEmpty({ message: 'Debes seleccionar una Gira / Concierto del selector maestro.' })
  concertEventId!: string;

  @IsString({ message: 'El ID del corte textil debe ser un identificador válido.' })
  @IsNotEmpty({ message: 'Debes seleccionar un Corte / Silueta textil del selector maestro.' })
  cutId!: string;

  @IsArray({ message: 'Las tallas deben enviarse en un arreglo de identificadores.' })
  @ArrayMinSize(1, { message: 'Debes seleccionar al menos una Talla activa para la prenda.' })
  @IsString({ each: true, message: 'Cada ID de talla debe ser una cadena de texto válida.' })
  sizeIds!: string[];

  @IsString({ message: 'La URL de la imagen debe ser una cadena de texto válida.' })
  @IsOptional()
  imageUrl?: string;
}
