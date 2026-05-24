import type { Config } from 'jest';

const config: Config = {
  displayName: 'api',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json' }],
  },
  collectCoverageFrom: ['**/*.(tj)s'],
  coverageDirectory: '../../coverage/apps/api',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
    '^@posy/shared$': '<rootDir>/../../../libs/shared/src/index.ts',
    '^@posy/auth$': '<rootDir>/../../../libs/auth/src/index.ts',
    '^@posy/auth/(.*)$': '<rootDir>/../../../libs/auth/src/$1',
    '^@posy/products$': '<rootDir>/../../../libs/products/src/index.ts',
    '^@posy/products/(.*)$': '<rootDir>/../../../libs/products/src/$1',
    '^@posy/orders$': '<rootDir>/../../../libs/orders/src/index.ts',
    '^@posy/orders/(.*)$': '<rootDir>/../../../libs/orders/src/$1',
    '^@posy/users$': '<rootDir>/../../../libs/users/src/index.ts',
    '^@posy/users/(.*)$': '<rootDir>/../../../libs/users/src/$1',
    '^@posy/categories$': '<rootDir>/../../../libs/categories/src/index.ts',
    '^@posy/categories/(.*)$': '<rootDir>/../../../libs/categories/src/$1',
    '^@posy/ingredients$': '<rootDir>/../../../libs/ingredients/src/index.ts',
    '^@posy/ingredients/(.*)$': '<rootDir>/../../../libs/ingredients/src/$1',
    '^@posy/user-tracking$': '<rootDir>/../../../libs/user-tracking/src/index.ts',
    '^@posy/user-tracking/(.*)$': '<rootDir>/../../../libs/user-tracking/src/$1',
    '^@posy/inventory$': '<rootDir>/../../../libs/inventory/src/index.ts',
    '^@posy/inventory/(.*)$': '<rootDir>/../../../libs/inventory/src/$1',
    '^@posy/recommendation$': '<rootDir>/../../../libs/recommendation/src/index.ts',
    '^@posy/recommendation/(.*)$': '<rootDir>/../../../libs/recommendation/src/$1',
    '^@posy/promotions$': '<rootDir>/../../../libs/promotions/src/index.ts',
    '^@posy/promotions/(.*)$': '<rootDir>/../../../libs/promotions/src/$1',
    '^@posy/table-sessions$': '<rootDir>/../../../libs/table-sessions/src/index.ts',
    '^@posy/table-sessions/(.*)$': '<rootDir>/../../../libs/table-sessions/src/$1',
    '^@posy/payments$': '<rootDir>/../../../libs/payments/src/index.ts',
    '^@posy/payments/(.*)$': '<rootDir>/../../../libs/payments/src/$1',
  },
};

export default config;
