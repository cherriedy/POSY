import { UserTrackingConfig } from './shared/interfaces';

export const USER_TRACKING_CONFIG: UserTrackingConfig = {
  redis: {
    prefix: 'interaction',
    pattern: 'interaction:*',
    TTL: {
      product: 14400, // 4 hours in seconds
    },
    batch: {
      size: 200, // Max number of commands per batch
      interval: 100, // Time in ms to wait before processing the batch
    },
  },
};
