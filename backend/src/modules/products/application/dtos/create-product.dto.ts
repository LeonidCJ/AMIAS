import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ArrayMinSize } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0.01, { message: 'basePrice must be greater than zero in PEN (S/).' })
  basePrice!: number;

  @IsString()
  @IsNotEmpty()
  concertEventId!: string;

  @IsString()
  @IsNotEmpty()
  cutId!: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one size (sizeId) must be selected for the garment.' })
  @IsString({ each: true })
  sizeIds!: string[];

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
