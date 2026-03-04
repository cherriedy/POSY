import { VendorStatus } from '../enums';

export class Vendor {
  constructor(
    public id?: string,
    public name?: string,
    public contactName: string | null = null,
    public email: string | null = null,
    public phone: string | null = null,
    public address: string | null = null,
    public taxCode: string | null = null,
    public paymentTerm: number | null = null,
    public note: string | null = null,
    public status: VendorStatus | null = VendorStatus.ACTIVE,
    public suspendedReason: string | null = null,
    public suspendedAt: Date | null = null,
    public suspendedUntil: Date | null = null,
    public isDeleted: boolean = false,
    public deletedAt: Date | null = null,
    public createdAt: Date | null = null,
    public updatedAt: Date | null = null,
  ) {}
}
