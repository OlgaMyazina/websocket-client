/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  modulePathIgnorePatterns: [
    '<rootDir>/node_modules.*/react',
    '<rootDir>/node_modules.*/react-dom',
  ],
  testTimeout: 30000,
}
