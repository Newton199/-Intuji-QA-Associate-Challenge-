export class HomePage {
  visit() {
    cy.visit('/')
    cy.contains('a', 'Home').should('be.visible')
  }

  gotoSignupLogin() {
    cy.contains('a', 'Signup / Login').click()
  }

  gotoProducts() {
    cy.contains('a', 'Products').click()
    cy.url().should('include', '/products')
  }

  isLoggedInAs(name) {
    return cy.contains('a', `Logged in as ${name}`)
  }

  logout() {
    // Be defensive: only click if Logout exists
    cy.get('body').then(($body) => {
      if ($body.find('a[href="/logout"]').length) {
        cy.get('a[href="/logout"]').first().click({ force: true })
      } else if ($body.find('a:contains("Logout")').length) {
        cy.contains('a', 'Logout').click({ force: true })
      } else {
        // no-op if not logged in
        cy.log('Logout link not found; assuming user is not logged in')
      }
    })
  }
}
