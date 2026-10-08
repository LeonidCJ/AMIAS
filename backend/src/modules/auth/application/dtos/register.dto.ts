import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../domain/user.entity';

export class RegisterDto {
  @IsEmail({}, { message: 'Debes proporcionar un correo electrónico válido.' })
  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío.' })
  email!: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía.' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  password!: string;

  @IsString({ message: 'El nombre completo debe ser una cadena de texto.' })
  @IsOptional()
  customerName?: string;

  @IsString({ message: 'El teléfono debe ser una cadena de texto.' })
  @IsOptional()
  customerPhone?: string;

  @IsEnum(UserRole, { message: 'El rol debe ser ADMIN u OPERARIO.' })
  @IsOptional()
  role?: UserRole;
}
