/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  preset: 'ts-jest',
  testEnvironment: "node",
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^../../actions/play-macro$': '<rootDir>/src/__mocks__/play-macro.ts',
    '^../../actions/record-macro$': '<rootDir>/src/__mocks__/record-macro.ts',
    '^../../utils/utils$': '<rootDir>/src/__mocks__/utils.ts',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        allowJs: true,
      },
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@elgato|node-global-key-listener)/)',
  ],
};