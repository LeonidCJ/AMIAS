import { IsNotEmpty, IsString, IsInt, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateConcertEventDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  venue!: string;

  @IsInt()
  @Min(1)
  capacity!: number;

  @IsNumber()
  rate!: number;

  @IsDateString()
  eventDate!: string;
}
