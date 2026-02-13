export const tableConfig = {
  name: {
    constraint: {
      minLength: 1,
      maxLength: 100,
      message: {
        mustString: 'Table name must be a string.',
        minLength: 'Table name must be at least 1 character long.',
        maxLength: 'Table name must not exceed 100 characters.',
        invalid: 'Invalid table name.',
      },
    },
  },
  capacity: {
    constraint: {
      min: 1,
      max: 32767,
      message: {
        mustNumber: 'Table capacity must be a number.',
        min: 'Table capacity must be at least 1.',
        max: 'Table capacity must not exceed 32767.',
        invalid: 'Invalid table capacity.',
      },
    },
  },
  position: {
    constraint: {
      min: -32768,
      max: 32767,
      message: {
        mustNumber: 'Position must be a number.',
        min: 'Position must be at least -32768.',
        max: 'Position must not exceed 32767.',
        invalid: 'Invalid position value.',
      },
    },
  },
};
