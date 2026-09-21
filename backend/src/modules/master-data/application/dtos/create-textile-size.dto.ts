import { IsNotEmpty, IsString, IsInt, Min, IsOptional } from 'class-validator';

export class CreateTextileSizeDto {
  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsInt()
  @Min(1)
  chestCm!: number;

  @IsInt()
  @Min(1)
  lengthCm!: number;

  @IsInt()
  @Min(1)
  shoulderCm!: number;

  @IsString()
  @IsOptional()
  heightRef?: string;
}
