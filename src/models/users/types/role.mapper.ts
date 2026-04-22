import { Role as PrismaRole } from '@prisma/client';
import { Role as DomainRole } from 'src/common/enums/role.enum';

export function mapRole(prismaRole: PrismaRole): DomainRole {
  switch (prismaRole) {
    case PrismaRole.ADMIN:
      return DomainRole.ADMIN;
    case PrismaRole.MANAGER:
      return DomainRole.MANAGER;
    case PrismaRole.KITCHEN:
      return DomainRole.KITCHEN;
    case PrismaRole.STAFF:
      return DomainRole.STAFF;
    default:
      throw new Error(`Invalid role: ${prismaRole}`);
  }
}