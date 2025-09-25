// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
// ***********************************************************

import './commands'

// Prevent Cypress from failing the test on uncaught exceptions from the app
Cypress.on('uncaught:exception', (err) => {
  // returning false here prevents Cypress from
  // failing the test due to third-party errors
  return false
})
