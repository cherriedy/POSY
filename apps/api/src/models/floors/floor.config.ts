export const floorConfig = {
  name: {
    constraint: {
      minLength: 1,
      maxLength: 50,
      message: {
        mustString: 'Floor name must be a string.',
        minLength: 'Floor name must be at least 1 character long.',
        maxLength: 'Floor name must not exceed 50 characters.',
        invalid: 'Invalid floor name.',
      },
    },
  },
  order: {
    constraint: {
      min: 0,
      max: 32767,
      message: {
        mustNumber: 'Floor order must be a number.',
        min: 'Floor order must be at least 0.',
        max: 'Floor order must not exceed 32767.',
        invalid: 'Invalid floor order.',
      },
    },
  },
};
