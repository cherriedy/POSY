import { BulkOperationStatusEnum } from '../enums/bulk-operation-status.enum';

/** Defines the status of a bulk operation item, which can be either 'SUCCEED' or 'FAILED'. */
export type BulkOperationStatus = keyof typeof BulkOperationStatusEnum;
