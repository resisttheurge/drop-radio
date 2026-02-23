import { readFileSync } from 'fs'
import type { Config } from 'jest'

// Reading the SWC compilation config for the spec files
const swcJestConfig = JSON.parse(
  readFileSync(`${__dirname}/.spec.swcrc`, 'utf-8')
)

// Disable .swcrc look-up by SWC core because we're passing in swcJestConfig ourselves
swcJestConfig.swcrc = false

export default {
  displayName: '@drop-radio/observable-child-process',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  testPathIgnorePatterns: ['^.+\\.arb\\.[tj]s$', '^.+\\.mock\\.[tj]s$'],
  coverageDirectory: 'test-output/jest/coverage',
  coverageReporters: ['text', 'html'],
  coveragePathIgnorePatterns: ['^.+\\.arb\\.[tj]s$', '^.+\\.mock\\.[tj]s$'],
  coverageProvider: 'v8',
} as Config
