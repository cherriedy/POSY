import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { tableConfig } from '../table.config';

const nameConstraints = tableConfig.name.constraint;

export function IsValidTableName(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidTableName',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any): boolean {
          if (typeof value !== 'string') return false;
          return (
            value.length >= nameConstraints.minLength &&
            value.length <= nameConstraints.maxLength
          );
        },
        defaultMessage(args: ValidationArguments): string {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const value = args.value;
          if (typeof value !== 'string') {
            return nameConstraints.message.mustString;
          }
          if (value.length < nameConstraints.minLength) {
            return nameConstraints.message.minLength;
          }
          if (value.length > nameConstraints.maxLength) {
            return nameConstraints.message.maxLength;
          }
          return nameConstraints.message.invalid;
        },
      },
    });
  };
}
