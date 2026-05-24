import type { Config } from 'jest';

const config: Config = {
  displayName: 'shared',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json' }],
  },
  collectCoverageFrom: ['**/*.(tj)s'],
  coverageDirectory: '../../coverage/libs/shared',
  testEnvironment: 'node',
};

export default config;
