export class PaymentPage {
  pay(nameOnCard, cardNumber, cvc, expiryMonth, expiryYear) {
    cy.get('input[name="name_on_card"]').type(nameOnCard)
    cy.get('input[name="card_number"]').type(cardNumber)
    cy.get('input[name="cvc"]').type(cvc)
    cy.get('input[name="expiry_month"]').type(expiryMonth)
    cy.get('input[name="expiry_year"]').type(expiryYear)
    cy.contains('button', 'Pay and Confirm Order').click()
  }

  assertOrderPlaced() {
    cy.contains('p', 'Your order has been placed successfully!').should('be.visible')
  }
}
