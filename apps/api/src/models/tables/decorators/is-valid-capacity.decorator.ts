import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { tableConfig } from '../table.config';

const capacityConstraints = tableConfig.capacity.constraint;

export function IsValidTableCapacity(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidTableCapacity',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any): boolean {
          if (typeof value !== 'number') return false;
          return (
            value >= capacityConstraints.min && value <= capacityConstraints.max
          );
        },
        defaultMessage(args: ValidationArguments): string {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const value = args.value;
          if (typeof value !== 'number') {
            return capacityConstraints.message.mustNumber;
          }
          if (value < capacityConstraints.min) {
            return capacityConstraints.message.min;
          }
          if (value > capacityConstraints.max) {
            return capacityConstraints.message.max;
          }
          return capacityConstraints.message.invalid;
        },
      },
    });
  };
}
