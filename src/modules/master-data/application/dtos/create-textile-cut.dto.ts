import { IsNotEmpty, IsString, IsInt, Min, IsOptional } from 'class-validator';

export class CreateTextileCutDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(50)
  grammageGsm!: number;

  @IsString()
  @IsOptional()
  description?: string;
}
