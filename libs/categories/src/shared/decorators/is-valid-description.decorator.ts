import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

const DesConstraint = {
  maxLength: 255,
  message: {
    invalid: 'Category description is invalid.',
    mustString: 'Category description must be a string.',
    maxLength: 'Category description must not exceed 255 characters.',
  },
};

export function IsValidCategoryDescription(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidCategoryDescription',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any): Promise<boolean> | boolean {
          if (value === undefined || value === null) return true;
          return (
            typeof value === 'string' && value.length <= DesConstraint.maxLength
          );
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
