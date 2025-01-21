module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(test).[tj]s'],
  modulePaths: ['<rootDir>/src'],
  testTimeout: 20000,
};
