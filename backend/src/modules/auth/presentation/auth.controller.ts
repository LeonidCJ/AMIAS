import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { RegisterDto } from '../application/dtos/register.dto';
import { LoginDto } from '../application/dtos/login.dto';
import { RegisterUserUseCase } from '../application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../application/use-cases/login-user.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.registerUserUseCase.execute(dto.email, dto.password, dto.role);
    return {
      message: 'User registered successfully',
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } = await this.loginUserUseCase.execute(dto.email, dto.password);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
