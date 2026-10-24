import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { USER_REPOSITORY, UserRepository } from '../../domain/user.repository';
import { UserEntity } from '../../domain/user.entity';
import { JwtService } from '../../infrastructure/services/jwt.service';

/**
 * Caso de uso de Rotación de Sesión JWT HttpOnly (Semana 3).
 *
 * - Verifica la validez criptográfica y expiración del refreshToken recibido por cookie HttpOnly.
 * - Previene ataques de Replay (reutilización de un refreshToken ya rotado o revocado).
 * - Emite un nuevo par { accessToken, refreshToken } con identificador único (jti).
 */
@Injectable()
export class RefreshSessionUseCase {
  private static readonly revokedTokenHashes = new Set<string>();

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  public revokeToken(token?: string): void {
    if (!token) return;
    RefreshSessionUseCase.revokedTokenHashes.add(this.hashToken(token));
  }

  async execute(
    oldRefreshToken?: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: UserEntity }> {
    if (!oldRefreshToken) {
      throw new UnauthorizedException('No se encontró cookie HttpOnly de sesión (refreshToken).');
    }

    const tokenHash = this.hashToken(oldRefreshToken);
    if (RefreshSessionUseCase.revokedTokenHashes.has(tokenHash)) {
      throw new UnauthorizedException(
        'Token de refresco revocado o ya rotado previamente (Detección de Replay). Inicia sesión nuevamente.',
      );
    }

    const payload = this.jwtService.verify(oldRefreshToken, 'refresh');
    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('El usuario asociado a la sesión ya no existe.');
    }

    // Invalidar el refresh token anterior para garantizar rotación estricta de un solo uso
    RefreshSessionUseCase.revokedTokenHashes.add(tokenHash);

    const nextPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      jti: crypto.randomUUID(),
    };

    const accessToken = this.jwtService.sign(nextPayload, 'access', 15);
    const refreshToken = this.jwtService.sign(nextPayload, 'refresh', 7 * 24 * 60);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }
}
