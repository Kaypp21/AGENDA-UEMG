export default {
  testEnvironment: 'jsdom',
  transform: {},
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/js/**/*.js',
    '!src/js/**/supabase.js',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
};
