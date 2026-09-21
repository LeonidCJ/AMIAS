import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class JwtService {
  private readonly accessSecret = process.env.JWT_ACCESS_SECRET || 'access_secret';
  private readonly refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh_secret';

  sign(payload: object, type: 'access' | 'refresh' = 'access', expiresInMinutes: number = 15): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const exp = Math.floor(Date.now() / 1000) + expiresInMinutes * 60;
    const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');

    const secret = type === 'access' ? this.accessSecret : this.refreshSecret;
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${body}`)
      .digest('base64url');

    return `${header}.${body}.${signature}`;
  }

  verify(token: string, type: 'access' | 'refresh' = 'access'): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new UnauthorizedException('Invalid token format');
      }
      const [header, body, signature] = parts;
      const secret = type === 'access' ? this.accessSecret : this.refreshSecret;

      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${header}.${body}`)
        .digest('base64url');

      if (signature !== expectedSignature) {
        throw new UnauthorizedException('Invalid token signature');
      }

      const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        throw new UnauthorizedException('Token expired');
      }

      return payload;
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
