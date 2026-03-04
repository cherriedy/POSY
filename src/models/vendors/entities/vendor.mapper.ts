import { Vendor } from './vendor.class';
import {
  Vendor as PrismaVendor,
  VendorStatus as PrismaVendorStatus,
} from '@prisma/client';
import { VendorStatus } from '../enums';

export class VendorMapper {
  static toDomain(this: void, prisma: PrismaVendor): Vendor {
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
      name: domain.name ?? undefined,
      contact_name: domain.contactName ?? null,
      email: domain.email ?? null,
      phone: domain.phone ?? null,
      address: domain.address ?? null,
      tax_code: domain.taxCode ?? null,
      payment_term: domain.paymentTerm ?? null,
      note: domain.note ?? null,
      status: domain.status as PrismaVendorStatus,
      suspended_reason: domain.suspendedReason ?? null,
      suspended_at: domain.suspendedAt ?? null,
      suspended_until: domain.suspendedUntil ?? null,
      is_deleted: domain.isDeleted,
      deleted_at: domain.deletedAt ?? null,
    };
  }
}
