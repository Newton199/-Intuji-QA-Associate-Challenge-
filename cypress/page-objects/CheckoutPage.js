export class CheckoutPage {
  proceedToCheckout() {
    cy.contains('a', 'Proceed To Checkout').click()
    cy.url().should('include', '/checkout')
  }

  placeOrder() {
    // There is a review and address info page
    cy.contains('a', 'Place Order').click()
  }
}
