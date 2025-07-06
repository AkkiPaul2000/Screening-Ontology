module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
  },
  rootDir: '.',
  transformIgnorePatterns: [
    'node_modules/(?!clsx)/'
  ],
};