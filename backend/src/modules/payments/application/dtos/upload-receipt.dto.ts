import { IsNotEmpty, IsString } from 'class-validator';

export class UploadReceiptDto {
  @IsString({ message: 'El ID de la orden debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El ID de la orden es obligatorio.' })
  orderId!: string;

  @IsString({ message: 'El código de operación debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El código de operación del voucher es obligatorio.' })
  operationCode!: string;
}
