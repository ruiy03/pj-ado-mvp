const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Next.jsアプリのディレクトリを指定
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  transformIgnorePatterns: [
    'node_modules/(?!(next-auth)/)',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
  ],
};

module.exports = createJestConfig(customJestConfig);
