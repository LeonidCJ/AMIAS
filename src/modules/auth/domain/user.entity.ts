export enum UserRole {
  ADMIN = 'ADMIN',
  OPERARIO = 'OPERARIO',
}

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly role: UserRole,
    public readonly createdAt: Date,
  ) {}
}
