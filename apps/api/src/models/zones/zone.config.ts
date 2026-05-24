export const zoneConfig = {
  name: {
    constraint: {
      minLength: 2,
      maxLength: 50,
      message: {
        invalid: 'Zone name is invalid.',
        mustString: 'Zone name must be a string.',
        minLength: 'Zone name must be at least 2 characters long.',
        maxLength: 'Zone name must not exceed 50 characters.',
      },
    },
  },
  description: {
    constraint: {
      maxLength: 500,
      message: {
        invalid: 'Zone description is invalid.',
        mustString: 'Zone description must be a string.',
        maxLength: 'Zone description must not exceed 500 characters.',
      },
    },
  },
};
