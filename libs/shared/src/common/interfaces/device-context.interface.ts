export interface DeviceContext {
  date: string;
  device: string;
  location: string;
}

export class InvalidDeviceException extends Error {
  constructor() {
    super(
      `Unable to determine client device information. Please ensure your device 
      is properly identified and try again.`,
    );
    this.name = 'InvalidDeviceException';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidDeviceException);
    }
  }
}

export const assertDevice = (device: any): void => {
  if (!device || typeof device !== 'string' || device === 'Unknown device') {
    throw new InvalidDeviceException();
  }
};
