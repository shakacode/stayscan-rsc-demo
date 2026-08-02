// Jest config for client-side JS/JSX. Uses @swc/jest for fast transforms
// (matches the swc webpack transpiler) and jsdom for component tests.
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  roots: ['<rootDir>/app'],
  testMatch: ['**/*.test.{js,jsx}'],
  transform: {
    '^.+\\.(j|t)sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: { syntax: 'ecmascript', jsx: true },
          transform: { react: { runtime: 'automatic' } },
        },
      },
    ],
  },
  moduleNameMapper: {
    '\\.(css|scss|sass)$': '<rootDir>/jest.styleMock.js',
  },
};
