/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/setup.ts'],
  collectCoverageFrom: [
    '../../packages/backend/src/**/*.ts',
    '!../../packages/backend/src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  testTimeout: 10000,
};