import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { USER_REPOSITORY, UserRepository } from '../../domain/user.repository';
import { UserEntity } from '../../domain/user.entity';
import { JwtService } from '../../infrastructure/services/jwt.service';

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: UserEntity }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, 'access', 15);
    const refreshToken = this.jwtService.sign(payload, 'refresh', 7 * 24 * 60);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }
}
