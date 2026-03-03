import { Vendor } from './vendor.class';
import { Vendor as PrismaVendor } from '@prisma/client';
import { VendorStatus } from '../enums';

export class VendorMapper {
  static toDomain(prisma: PrismaVendor): Vendor {
    return new Vendor(
      prisma.id,
      prisma.name,
      prisma.contact_name,
      prisma.email,
      prisma.phone,
      prisma.address,
      prisma.tax_code,
      prisma.payment_term,
      prisma.note,
      prisma.status as VendorStatus,
      prisma.suspended_reason,
      prisma.suspended_at,
      prisma.suspended_until,
      prisma.is_deleted,
      prisma.deleted_at,
      prisma.created_at,
      prisma.updated_at,
    );
  }

  static toPrisma(domain: Vendor): Partial<PrismaVendor> {
    return {
      id: domain.id ?? undefined,
      name: domain.name,
      contact_name: domain.contactName,
      email: domain.email,
      phone: domain.phone,
      address: domain.address,
      tax_code: domain.taxCode,
      payment_term: domain.paymentTerm,
      note: domain.note,
      status: domain.status,
      suspended_reason: domain.suspendedReason,
      suspended_at: domain.suspendedAt,
      suspended_until: domain.suspendedUntil,
      is_deleted: domain.isDeleted,
      deleted_at: domain.deletedAt,
    };
  }
}
