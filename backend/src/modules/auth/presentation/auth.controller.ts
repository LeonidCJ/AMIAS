import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { RegisterDto } from '../application/dtos/register.dto';
import { LoginDto } from '../application/dtos/login.dto';
import { RegisterUserUseCase } from '../application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../application/use-cases/login-user.use-case';
import { RefreshSessionUseCase } from '../application/use-cases/refresh-session.use-case';
import { AuthThrottlerGuard } from '../infrastructure/guards/auth-throttler.guard';
import { PrismaService } from '../../../prisma/prisma.service';

import { UserRole } from '../domain/user.entity';

@Controller('auth')
@UseGuards(AuthThrottlerGuard)
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly refreshSessionUseCase: RefreshSessionUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.registerUserUseCase.execute(
      dto.email,
      dto.password,
      dto.customerName,
      dto.customerPhone,
      UserRole.CLIENT,
    );
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

    const userProfile = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    return {
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        customerName: userProfile?.customerName || user.email.split('@')[0],
        customerPhone: userProfile?.customerPhone || '',
      },
    };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const incomingRefreshToken = req.cookies?.refreshToken;
    const { accessToken, refreshToken, user } = await this.refreshSessionUseCase.execute(incomingRefreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days rotated
    });

    return {
      message: 'Session rotated successfully',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const incomingRefreshToken = req.cookies?.refreshToken;
    this.refreshSessionUseCase.revokeToken(incomingRefreshToken);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return {
      message: 'Session closed and refreshToken revoked successfully',
    };
  }
}
