/**
 * TEST SETUP GUIDE
 *
 * Instructions for setting up Jest and Testing Library in Midori
 */

// ============================================================================
// INSTALLATION
// ============================================================================

/*
Run these commands to add testing libraries:

npm install --save-dev jest @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/jest

OR with yarn:

yarn add --dev jest @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/jest

OR with pnpm:

pnpm add -D jest @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/jest
*/

// ============================================================================
// JEST CONFIGURATION (jest.config.mjs)
// ============================================================================

/*
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\\\.tsx?$': 'ts-jest',
  },
}
*/

// ============================================================================
// JEST SETUP (jest.setup.js)
// ============================================================================

/*
import '@testing-library/jest-dom'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock as any

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  configurable: true,
  value: true,
})
*/

// ============================================================================
// PACKAGE.JSON UPDATES
// ============================================================================

/*
Add to package.json scripts:

"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
*/

// ============================================================================
// FILE STRUCTURE
// ============================================================================

/*
__tests__/
├── hooks/
│   ├── usePomodoro.test.ts
│   ├── useMusic.test.ts
│   ├── useOffline.test.ts
│   ├── useAnalytics.test.ts
│   └── useValidation.test.ts
├── lib/
│   ├── analytics.test.ts
│   ├── offline-manager.test.ts
│   ├── schemas.test.ts
│   └── task-utils.test.ts
├── components/
│   ├── error-boundary.test.tsx
│   ├── offline-indicator.test.tsx
│   └── custom-tracks-manager.test.tsx
└── mocks/
    ├── firebase.ts
    └── data-provider.tsx
*/

// ============================================================================
// RUNNING TESTS
// ============================================================================

/*
npm run test              # Run all tests once
npm run test:watch       # Watch mode for development
npm run test:coverage    # Generate coverage report
npm run test -- --testPathPattern=hooks  # Run specific tests
*/

export {}
