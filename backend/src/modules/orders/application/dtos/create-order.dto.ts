import { IsArray, IsNotEmpty, IsNumber, IsString, Min, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsString({ message: 'El ID del producto debe ser una cadena de texto válida.' })
  @IsNotEmpty({ message: 'El ID del producto es obligatorio.' })
  productId!: string;

  @IsString({ message: 'El ID de la talla debe ser una cadena de texto válida.' })
  @IsNotEmpty({ message: 'El ID de la talla es obligatorio.' })
  sizeId!: string;

  @IsNumber({}, { message: 'La cantidad debe ser un número entero.' })
  @Min(1, { message: 'La cantidad debe ser de al menos 1 unidad.' })
  quantity!: number;
}

export class CreateOrderDto {
  @IsString({ message: 'El nombre del cliente debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre del cliente no puede estar vacío.' })
  customerName!: string;

  @IsString({ message: 'El teléfono del cliente debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El teléfono del cliente no puede estar vacío.' })
  customerPhone!: string;

  @IsArray({ message: 'Los ítems del pedido deben ser un arreglo.' })
  @ArrayMinSize(1, { message: 'El pedido debe contener al menos un ítem.' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
