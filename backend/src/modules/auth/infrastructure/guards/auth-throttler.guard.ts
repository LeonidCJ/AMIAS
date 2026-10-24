import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface RateLimitBucket {
  count: number;
  expiresAt: number;
}

/**
 * Throttler / Rate-Limiting Guard para protección contra fuerza bruta en Auth (Semana 3).
 * Implementa ventana deslizante por IP + ruta con cabeceras estándar X-RateLimit-* y bloqueo HTTP 429.
 */
@Injectable()
export class AuthThrottlerGuard implements CanActivate {
  private static readonly store = new Map<string, RateLimitBucket>();
  private readonly ttlMs = Number(process.env.THROTTLER_TTL_MS || 60_000); // 60 segundos
  private readonly limit = Number(process.env.THROTTLER_LIMIT || 10); // máx 10 peticiones por minuto

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket.remoteAddress ||
      'unknown';

    const key = `throttle:${ip}:${req.path}`;
    const now = Date.now();

    const existing = AuthThrottlerGuard.store.get(key);
    let bucket: RateLimitBucket;

    if (!existing || now >= existing.expiresAt) {
      bucket = { count: 1, expiresAt: now + this.ttlMs };
      AuthThrottlerGuard.store.set(key, bucket);
    } else {
      existing.count += 1;
      bucket = existing;
    }

    const remaining = Math.max(0, this.limit - bucket.count);
    const resetSeconds = Math.ceil((bucket.expiresAt - now) / 1000);

    res.setHeader('X-RateLimit-Limit', String(this.limit));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(resetSeconds));

    if (bucket.count > this.limit) {
      res.setHeader('Retry-After', String(resetSeconds));
      throw new HttpException(
        `Demasiados intentos de autenticación desde esta IP (Throttler activo). Intenta nuevamente en ${resetSeconds} segundos.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
