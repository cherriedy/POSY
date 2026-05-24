import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * Custom decorator to validate that when a related boolean property is true,
 * the decorated property must have a valid value (not null or undefined).
 *
 * @param property - The name of the boolean property to check (e.g., 'isSeasonal')
 * @param validationOptions - Optional validation options including custom error message
 *
 * @example
 * class ProductAttributeDto {
 *   isSeasonal: boolean;
 *
 *   @RequiredWhen('isSeasonal', {
 *     message: 'Season must be provided when product is seasonal'
 *   })
 *   season?: Season | null;
 * }
 */
export function RequiredWhen(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'requiredWhen',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const relatedPropertyName = args.constraints[0] as string;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const relatedValue = (args.object as Record<string, any>)[
            relatedPropertyName
          ];

          // If the related property is true, this field must be provided
          if (relatedValue === true) {
            return value !== null && value !== undefined;
          }

          // If the related property is false or undefined, this field is optional
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const relatedPropertyName = args.constraints[0] as string;
          return `${args.property} must be provided when ${relatedPropertyName} is true`;
        },
      },
    });
  };
}
