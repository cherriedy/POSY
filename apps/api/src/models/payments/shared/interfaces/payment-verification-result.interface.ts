export enum PaymentVerificationStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

/**
 * Represents the result of a payment verification process.
 *
 * @property amount {number} - The amount that was verified.
 * @property transactionId {string} - The unique identifier for the transaction.
 * @property rawResponse {Record<string, any>} - Optional raw response data from the payment gateway.
 * @property status {PaymentVerificationStatus} - The status of the payment verification.
 */
export interface PaymentVerificationResult {
  amount: number;
  transactionId: string;
  rawResponse?: Record<string, any>;
  status: PaymentVerificationStatus;
}
