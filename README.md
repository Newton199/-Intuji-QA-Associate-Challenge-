# AutomationExercise Cypress POM Tests

End-to-end tests for https://automationexercise.com built with Cypress using the Page Object Model (POM), custom commands, fixtures, network intercepts, and session caching.

## Features
- **POM structure** under `cypress/page-objects/` for readable and maintainable tests
- **Custom commands** in `cypress/support/commands.js` for signup/login, add-to-cart, assertions, parsing prices
- **Fixtures** for test data in `cypress/fixtures/`
- **Session caching** via `cy.session` to speed up multi-spec flows
- **Network intercepts** to validate API responses
- **Videos & screenshots** saved to `cypress/videos/` and `cypress/screenshots/`

## Tech stack
- **Cypress** ^13.x
- **@faker-js/faker** for reliable random test data
- Node.js >= 18 (see `package.json` engines)

## Project structure
```
.
├─ cypress/
│  ├─ e2e/
│  │  └─ pom_features.cy.js            # Main end-to-end spec covering positive/negative flows
│  ├─ fixtures/
│  │  ├─ user.json                      # Sample valid/invalid credentials
│  │  └─ products.json                  # Sample product/category data
│  ├─ page-objects/                     # Page Object Model classes
│  │  ├─ HomePage.js
│  │  ├─ ProductsPage.js
│  │  ├─ ProductDetailPage.js
│  │  ├─ CartPage.js
│  │  ├─ CheckoutPage.js
│  │  └─ PaymentPage.js
│  └─ support/
│     ├─ e2e.js                         # Global setup, imports, exception handler
│     ├─ commands.js                    # Custom Cypress commands
│     └─ userFactory.js                 # ES module factory used within test spec
├─ cypress.config.js                    # Cypress configuration (baseUrl, timeouts, retries)
├─ package.json                         # Scripts and dev dependencies
└─ package-lock.json
```

## Prerequisites
- Node.js 18 or later
- npm 9+ recommended

Verify versions:
```
node -v
npm -v
```

## Setup
Install dependencies:
```
npm ci
```
If you plan to update dependencies locally, you can use:
```
npm install
```

## Scripts
Defined in `package.json`:
- `npm run cy:open` — Open Cypress Test Runner (interactive)
- `npm run cy:run` — Run tests headlessly
- `npm test` — Alias for `cypress run`

## Configuration
- Base URL: `https://automationexercise.com` (see `cypress.config.js`)
- Viewport: 1366x768
- Timeouts and retries tuned for stability
- Videos and screenshots enabled by default

## Running tests
- Interactive runner (choose browser/spec):
```
npm run cy:open
```
- Headless run (Electron by default):
```
npm run cy:run
```
- Run a single spec headless:
```
npx cypress run --spec cypress/e2e/pom_features.cy.js
```
- Run in a specific browser (e.g., Chrome):
```
npx cypress run --browser chrome --spec cypress/e2e/pom_features.cy.js
```

## What the main spec covers
File: `cypress/e2e/pom_features.cy.js`
- Loads Products page and validates API response via `cy.intercept`
- Filters Women > Dress and verifies product name using `ProductsPage` + `cy.verifyProduct`
- Adds products to cart using `cy.addToCart` and validates cart
- Negative login with invalid credentials (from `fixtures/user.json`)
- Happy-path checkout with a known-good fake card and success assertion
- Negative payment with an invalid card expecting an error

## Test data and sessions
- Runtime users are generated with `@faker-js/faker` using `generateUser()` (see `cypress/support/userFactory.js` and `commands.js`). Emails use the `example.com` domain to avoid sending real email.
- The test suite signs up once in `before()` and **persists the session** across tests using `cy.ensureLoggedIn` with `cy.session` caching.
- The site is a public demo environment; permanent data cleanup is generally not required, but signup re-tries create a new email if a collision occurs.

## Common workflows
- Update selectors or flows in POM classes inside `cypress/page-objects/` to keep specs clean
- Add reusable flows and assertions in `cypress/support/commands.js`
- Store static test data in `cypress/fixtures/`

### Adding a new page object
1. Create `cypress/page-objects/MyNewPage.js` exporting a class with methods for actions/assertions
2. Import and instantiate it in your spec: `import { MyNewPage } from '../page-objects/MyNewPage'`
3. Encapsulate page-specific logic to keep specs high-level and readable

## Visual testing (optional)
`cypress-image-diff-js` is listed as a devDependency but not currently wired up in `cypress.config.js`. If you want to enable visual regression testing, integrate the plugin and add baseline images accordingly.

## CI (optional)
You can run these tests in CI. Example GitHub Actions workflow:
```yaml
name: e2e
on: [push, pull_request]
jobs:
  cypress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npx cypress run --browser chrome
```

## Troubleshooting
- Ensure Node.js >= 18 and a stable network connection (the tests hit a live site)
- If the site UI changes, update selectors within POM classes and/or custom commands
- Retry signup uses a fresh email when a duplicate email error is detected
- If a modal blocks navigation (e.g., add-to-cart modal), the code defensively closes it before continuing

## License
No explicit license included. Add one if you intend to share publicly.
