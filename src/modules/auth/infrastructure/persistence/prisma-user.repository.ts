import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { UserEntity, UserRole } from '../../domain/user.entity';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const record = await this.prisma.user.findUnique({ where: { email } });
    if (!record) return null;
    return new UserEntity(record.id, record.email, record.passwordHash, record.role as UserRole, record.createdAt);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    if (!record) return null;
    return new UserEntity(record.id, record.email, record.passwordHash, record.role as UserRole, record.createdAt);
  }

  async save(user: UserEntity): Promise<UserEntity> {
    const record = await this.prisma.user.create({
      data: {
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
      },
    });
    return new UserEntity(record.id, record.email, record.passwordHash, record.role as UserRole, record.createdAt);
  }
}
