import { VendorStatus } from '../enums';

/**
 * Payload for creating a vendor.
 * This is the contract between the controller and service layer.
 */
export interface VendorCreatePayload {
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  taxCode: string | null;
  paymentTerm: number | null;
  note: string | null;
  status: VendorStatus | null;
}

/**
 * Payload for updating a vendor.
 * This is the contract between the controller and service layer.
 */
export interface VendorUpdatePayload {
  name?: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  taxCode: string | null;
  paymentTerm: number | null;
  note: string | null;
  status: VendorStatus | null;
}
