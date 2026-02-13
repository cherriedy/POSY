import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { zoneConfig } from '../zone.config';

const DesConstraint = zoneConfig.description.constraint;

export function IsValidZoneDescription(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidZoneDescription',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any): Promise<boolean> | boolean {
          if (value === undefined || value === null) return true;
          if (typeof value !== 'string') return false;
          if (value.length > DesConstraint.maxLength) return false;
          return true;
        },
        defaultMessage(arg: ValidationArguments): string {
          const value: unknown = arg.value;
          if (typeof value !== 'string') {
            return DesConstraint.message.mustString;
          }
          if (value.length > DesConstraint.maxLength) {
            return DesConstraint.message.maxLength;
          }
          return DesConstraint.message.invalid;
        },
      },
    });
  };
}
