import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { floorConfig } from '../floor.config';

const orderConstraints = floorConfig.order.constraint;

export function IsValidFloorOrder(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidFloorOrder',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any): boolean {
          if (typeof value !== 'number') return false;
          return value >= orderConstraints.min && value <= orderConstraints.max;
        },
        defaultMessage(args: ValidationArguments): string {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const value = args.value;
          if (typeof value !== 'number') {
            return orderConstraints.message.mustNumber;
          }
          if (value < orderConstraints.min) {
            return orderConstraints.message.min;
          }
          if (value > orderConstraints.max) {
            return orderConstraints.message.max;
          }
          return orderConstraints.message.invalid;
        },
      },
    });
  };
}
