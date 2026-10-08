import { Inject, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { USER_REPOSITORY, UserRepository } from '../../domain/user.repository';
import { UserEntity, UserRole } from '../../domain/user.entity';
import { DomainException } from '../../../../core/exceptions/domain.exception';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    email: string,
    password: string,
    customerName?: string,
    customerPhone?: string,
    role?: UserRole,
  ): Promise<UserEntity> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new DomainException(`El correo electrónico '${email}' ya se encuentra registrado.`);
    }

    const passwordHash = await argon2.hash(password);
    const assignedRole = role || UserRole.OPERARIO;

    const newUser = new UserEntity(
      '',
      email,
      passwordHash,
      assignedRole,
      new Date(),
    );

    const savedUser = await this.userRepository.save(newUser);

    // Update customerName and customerPhone on created user
    if (customerName || customerPhone) {
      await this.prisma.user.update({
        where: { id: savedUser.id },
        data: {
          ...(customerName ? { customerName: customerName.trim() } : {}),
          ...(customerPhone ? { customerPhone: customerPhone.trim() } : {}),
        },
      });
    }

    return savedUser;
  }
}
