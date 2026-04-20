/**
 * Represents the callback payload structure from Momo payment gateway.
 *
 * @property {string} partnerCode - The partner code provided by Momo.
 * @property {string} accessKey - The access key used for the transaction.
 * @property {string} orderId - The unique identifier for the order.
 * @property {string} requestId - The unique identifier for the request.
 * @property {string} amount - The amount of the transaction.
 * @property {string} orderInfo - Information about the order.
 * @property {string} orderType - The type of order.
 * @property {string} transId - The transaction ID from Momo.
 * @property {number} resultCode - The result code of the transaction.
 * @property {string} message - A message describing the transaction result.
 * @property {string} payType - The type of payment.
 * @property {string} responseTime - The timestamp when the response was generated.
 * @property {string} extraData - Additional data related to the transaction.
 * @property {string} signature - The signature for verifying the integrity of the callback data.
 */
export interface MomoCallbackPayload {
  partnerCode: string;
  accessKey: string;
  orderId: string;
  requestId: string;
  amount: string;
  orderInfo: string;
  orderType: string;
  transId: string;
  resultCode: number;
  message: string;
  payType: string;
  responseTime: string;
  extraData: string;
  signature: string;
}
