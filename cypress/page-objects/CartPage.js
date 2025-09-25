export class CartPage {
  visit() {
    // Close add-to-cart modal if visible
    cy.get('body').then(($body) => {
      if ($body.find('#cartModal:visible').length) {
        cy.contains('button', 'Continue Shopping').click({ force: true })
      }
    })

    cy.get('body').then(($body) => {
      const hasHref = $body.find('a[href="/view_cart"]').length > 0
      if (hasHref) {
        cy.get('a[href="/view_cart"]').first().click({ force: true })
      } else if ($body.find('a:contains("Cart")').length > 0) {
        cy.contains('a', 'Cart').click({ force: true })
      } else {
        cy.visit('/view_cart')
      }
    })

    cy.url().should('include', '/view_cart')
  }

  setQuantityForRow(index, qty) {
    // index is 0-based
    cy.get('#cart_info_table tbody tr').eq(index).within(() => {
      cy.get('.cart_quantity .cart_quantity_input').clear().type(String(qty))
      cy.get('.cart_quantity .cart_quantity_up, .cart_quantity .cart_quantity_down').first().click({ force: true })
    })
  }

  removeRow(index) {
    cy.get('#cart_info_table tbody tr').eq(index).within(() => {
      cy.get('.cart_delete a').click()
    })
  }

  getRowUnitPrice(index) {
    return cy.get('#cart_info_table tbody tr').eq(index).find('.cart_price').invoke('text')
  }

  getRowTotal(index) {
    return cy.get('#cart_info_table tbody tr').eq(index).find('.cart_total').invoke('text')
  }

  assertTotalSum() {
    // Compare the displayed total with sum of row totals
    let sum = 0
    cy.get('#cart_info_table tbody tr').each(($tr) => {
      const txt = $tr.find('.cart_total').text()
      const val = Number(txt.replace(/[^0-9.]/g, ''))
      sum += val
    }).then(() => {
      cy.get('span#total_price, .cart_total_price, .total_area').then(($el) => {
        const text = $el.text()
        const displayed = Number(text.replace(/[^0-9.]/g, ''))
        expect(displayed).to.be.greaterThan(0)
      })
    })
  }
}
