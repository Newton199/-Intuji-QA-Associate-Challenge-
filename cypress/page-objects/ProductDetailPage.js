export class ProductDetailPage {
  assertBasicInfo() {
    cy.get('.product-information').within(() => {
      cy.get('h2').should('be.visible')
      cy.contains('span', 'Rs.').should('be.visible')
      cy.contains('p', 'Availability').should('be.visible')
    })
  }

  addToCart(quantity = 1) {
    if (quantity > 1) {
      cy.get('input#quantity').clear().type(String(quantity))
    }
    cy.contains('button', 'Add to cart').click()
    cy.contains('#cartModal', 'Added!').should('be.visible')
    cy.contains('button', 'Continue Shopping').click({ force: true })
  }
}
