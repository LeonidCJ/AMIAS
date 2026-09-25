import { IsNotEmpty, IsString, IsInt, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateConcertEventDto {
  @IsString({ message: 'El nombre del concierto debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre del concierto no puede estar vacío.' })
  name!: string;

  @IsString({ message: 'El lugar/recinto del concierto debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El lugar/recinto del concierto no puede estar vacío.' })
  venue!: string;

  @IsInt({ message: 'El aforo debe ser un número entero.' })
  @Min(1, { message: 'El aforo del recinto debe ser de al menos 1 persona.' })
  capacity!: number;

  @IsNumber({}, { message: 'La tasa debe ser un número decimal válido.' })
  rate!: number;

  @IsDateString({}, { message: 'La fecha del evento debe tener un formato ISO 8601 válido.' })
  eventDate!: string;
}
