import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { USER_REPOSITORY } from './domain/user.repository';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { AuthController } from './presentation/auth.controller';
import { JwtService } from './infrastructure/services/jwt.service';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    RegisterUserUseCase,
    LoginUserUseCase,
    JwtService,
  ],
  exports: [USER_REPOSITORY, JwtService],
})
export class AuthModule {}
