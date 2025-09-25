export class ProductsPage {
  filterWomenDress() {
    // Left sidebar categories: Women > Dress
    cy.contains('a', 'Women').click()
    cy.contains('a', 'Dress').click()
    cy.get('.features_items').should('contain.text', 'Dress')
  }

  openProductByName(partialName) {
    cy.get('.features_items .product-image-wrapper').contains(partialName).first().parents('.product-image-wrapper').within(() => {
      cy.contains('a', 'View Product').invoke('removeAttr', 'target').click()
    })
  }

  openFirstProduct() {
    cy.get('.features_items .product-image-wrapper').first().within(() => {
      cy.contains('a', 'View Product').invoke('removeAttr', 'target').click()
    })
  }
}
