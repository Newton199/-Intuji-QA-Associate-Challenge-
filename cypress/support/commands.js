const { faker } = require('@faker-js/faker')

Cypress.Commands.add('generateUser', () => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const email = faker.internet.email({ firstName, lastName, provider: 'example.com' }).toLowerCase()
  const password = faker.internet.password({ length: 12 })
  const address = faker.location.streetAddress()
  const country = 'India'
  const state = faker.location.state()
  const city = faker.location.city()
  const zipcode = faker.location.zipCode()
  const mobile = faker.phone.number('+91 ##########')

  return {
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    email,
    password,
    address,
    country,
    state,
    city,
    zipcode,
    mobile,
  }
})

function freshEmail(name) {
  const [firstName, lastName] = name.split(' ')
  return faker.internet.email({ firstName, lastName, provider: 'example.com' }).toLowerCase()
}

Cypress.Commands.add('signup', (user) => {
  // Try clicking link if present, otherwise navigate directly
  cy.visit('/')
  cy.get('body').then(($body) => {
    if ($body.find('a[href="/login"]').length) {
      cy.get('a[href="/login"]').first().click({ force: true })
    } else if ($body.find('a:contains("Signup / Login")').length) {
      cy.contains('a', 'Signup / Login').click({ force: true })
    } else {
      cy.visit('/login')
    }
  })

  // Signup form on right side
  cy.contains('h2', 'New User Signup!').should('be.visible')

  const trySignup = (attempt = 1) => {
    cy.log(`Signup attempt ${attempt}`)
    cy.get('input[data-qa="signup-name"]').clear().type(user.name)
    cy.get('input[data-qa="signup-email"]').clear().type(user.email)
    cy.get('button[data-qa="signup-button"]').click()

    // If email exists, site shows an error on the same page
    cy.get('body').then(($body) => {
      const errorExists = $body.find('p:contains("Email Address already exist!")').length > 0
      if (errorExists) {
        if (attempt >= 3) {
          throw new Error('Email already exists after 3 attempts')
        }
        // generate new email and retry
        user.email = freshEmail(user.name)
        cy.contains('h2', 'New User Signup!').should('be.visible')
        trySignup(attempt + 1)
      } else {
        // Proceed with account information if navigated
        cy.contains('b', 'Enter Account Information').should('be.visible')

        cy.get('#id_gender1').check({ force: true })
        cy.get('#password').type(user.password)

        // DOB - optional; set a valid one
        cy.get('#days').select('10')
        cy.get('#months').select('May')
        cy.get('#years').select('1995')

        // Check newsletters (optional)
        cy.get('#newsletter').check({ force: true })
        cy.get('#optin').check({ force: true })

        // Address info
        cy.get('#first_name').clear().type(user.firstName)
        cy.get('#last_name').clear().type(user.lastName)
        cy.get('#company').clear().type('ACME QA')
        cy.get('#address1').clear().type(user.address)
        cy.get('#country').select(user.country)
        cy.get('#state').clear().type(user.state)
        cy.get('#city').clear().type(user.city)
        cy.get('#zipcode').clear().type(user.zipcode)
        cy.get('#mobile_number').clear().type(user.mobile)

        cy.get('button[data-qa="create-account"]').click()
        cy.contains('b', 'Account Created!').should('be.visible')
        cy.get('a[data-qa="continue-button"]').click()

        // Verify logged in
        cy.contains('a', `Logged in as ${user.name}`).should('be.visible')
      }
    })
  }

  trySignup(1)
})

Cypress.Commands.add('login', (email, password, nameForAssertion) => {
  // If already logged in, short-circuit
  cy.visit('/')
  cy.get('body').then(($body) => {
    const loggedIn = $body.find('a:contains("Logged in as")').length > 0
    if (loggedIn) {
      return
    }
    // Navigate to login page robustly
    if ($body.find('a[href="/login"]').length) {
      cy.get('a[href="/login"]').first().click({ force: true })
    } else if ($body.find('a:contains("Signup / Login")').length) {
      cy.contains('a', 'Signup / Login').click({ force: true })
    } else {
      cy.visit('/login')
    }
  })

  cy.contains('h2', 'Login to your account').should('be.visible')
  cy.get('input[data-qa="login-email"]').clear().type(email)
  cy.get('input[data-qa="login-password"]').clear().type(password)
  cy.get('button[data-qa="login-button"]').click()

  if (nameForAssertion) {
    cy.contains('a', `Logged in as ${nameForAssertion}`).should('be.visible')
  }
})

Cypress.Commands.add('ensureLoggedIn', (user) => {
  cy.session([user.email, user.password], () => {
    cy.visit('/')
    cy.login(user.email, user.password, user.name)
  }, {
    cacheAcrossSpecs: true,
  })
})

Cypress.Commands.add('logoutIfLoggedIn', () => {
  cy.visit('/')
  cy.get('body').then(($body) => {
    if ($body.find('a[href="/logout"]').length) {
      cy.get('a[href="/logout"]').first().click({ force: true })
    } else if ($body.find('a:contains("Logout")').length) {
      cy.contains('a', 'Logout').click({ force: true })
    } else {
      cy.log('No Logout link; already logged out')
    }
  })
})

// Add to cart by opening product detail page and adding quantity
Cypress.Commands.add('addToCart', ({ nameContains = null, quantity = 1 } = {}) => {
  // If a modal is open, close it first
  cy.get('body').then(($body) => {
    if ($body.find('#cartModal:visible').length) {
      cy.contains('button', 'Continue Shopping').click({ force: true })
    }
  })

  if (nameContains) {
    cy.get('.features_items .product-image-wrapper').contains(nameContains).first().parents('.product-image-wrapper').within(() => {
      cy.contains('a', 'View Product').invoke('removeAttr', 'target').click()
    })
  } else {
    cy.get('.features_items .product-image-wrapper').first().within(() => {
      cy.contains('a', 'View Product').invoke('removeAttr', 'target').click()
    })
  }

  // On product detail page
  if (quantity > 1) {
    cy.get('input#quantity').clear().type(String(quantity))
  }
  cy.contains('button', 'Add to cart').click()
  cy.contains('#cartModal', 'Added!').should('be.visible')
  cy.contains('button', 'Continue Shopping').click({ force: true })
})

// Verify product details on product detail page
Cypress.Commands.add('verifyProduct', ({ expectNameContains = null } = {}) => {
  cy.get('.product-information').within(() => {
    if (expectNameContains) {
      cy.get('h2').invoke('text').should((t) => {
        expect(t.toLowerCase()).to.contain(expectNameContains.toLowerCase())
      })
    } else {
      cy.get('h2').should('be.visible')
    }
    cy.contains('span', 'Rs.').should('be.visible')
    cy.contains('p', 'Availability').should('be.visible')
  })
})

// Utility: parse price like 'Rs. 500' -> 500
Cypress.Commands.add('parsePrice', (text) => {
  const match = text.replace(/[^0-9.]/g, '')
  return Number(match)
})

// Type declarations for TS users (ignored in JS)
// eslint-disable-next-line no-unused-vars
/**
 * @typedef {import('cypress').Cypress.Chainable} Chainable
 */
