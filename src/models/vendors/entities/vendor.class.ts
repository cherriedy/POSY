import { VendorStatus } from '../enums';

export class Vendor {
  constructor(
    public id: string,
    public name: string,
    public contactName: string | null,
    public email: string | null,
    public phone: string | null,
    public address: string | null,
    public taxCode: string | null,
    public paymentTerm: number | null,
    public note: string | null,
    public status: VendorStatus | null = VendorStatus.ACTIVE,
    public suspendedReason: string | null,
    public suspendedAt: Date | null,
    public suspendedUntil: Date | null,
    public isDeleted: boolean = false,
    public deletedAt: Date | null,
    public createdAt: Date | null,
    public updatedAt: Date | null,
  ) {}
}
