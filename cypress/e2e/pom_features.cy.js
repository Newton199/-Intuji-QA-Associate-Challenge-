import { HomePage } from '../page-objects/HomePage'
import { ProductsPage } from '../page-objects/ProductsPage'
import { ProductDetailPage } from '../page-objects/ProductDetailPage'
import { CartPage } from '../page-objects/CartPage'
import { CheckoutPage } from '../page-objects/CheckoutPage'
import { PaymentPage } from '../page-objects/PaymentPage'
import { generateUser } from '../support/userFactory'

const home = new HomePage()
const products = new ProductsPage()
const productDetail = new ProductDetailPage()
const cart = new CartPage()
const checkout = new CheckoutPage()
const payment = new PaymentPage()

// Fixtures
let fxUser
let fxProducts
let runtimeUser

describe('POM features with fixtures, intercepts, visuals, and negatives', () => {
  before(() => {
    cy.fixture('user').then((u) => (fxUser = u))
    cy.fixture('products').then((p) => (fxProducts = p))

    // Create a fresh user for positive flows
    runtimeUser = generateUser()

    // Sign up once and persist the session
    home.visit()
    cy.signup(runtimeUser)
    cy.ensureLoggedIn(runtimeUser)
  })

  beforeEach(() => {
    // Reuse session for each test and start from homepage
    cy.ensureLoggedIn(runtimeUser)
    home.visit()
  })

  it('Products page loads and API responds', () => {
    // Intercept products listing request
    cy.intercept('GET', '**/products').as('getProducts')

    home.gotoProducts()

    // Assert network
    cy.wait('@getProducts').its('response.statusCode').should('eq', 200)
  })

  it('Filter Women > Dress using POM and verify product via custom command', () => {
    const { expectedKeyword } = fxProducts.womenDress

    home.gotoProducts()
    products.filterWomenDress()

    // Open and verify the first product contains expected keyword
    products.openFirstProduct()
    cy.verifyProduct({ expectNameContains: expectedKeyword })
  })

  it('Add to cart using custom command and verify cart view', () => {
    // Go to products and add first product with quantity 2
    home.gotoProducts()
    cy.addToCart({ quantity: 2 })

    // Navigate to cart via POM (robust visit)
    cart.visit()

    // Ensure at least one row is present
    cy.get('#cart_info_table tbody tr').should('have.length.at.least', 1)
  })

  it('Negative: invalid login shows correct error', () => {
    // Log out first
    home.logout()

    // Navigate to login page directly
    cy.visit('/login')

    // Fill invalid credentials from fixtures
    cy.get('input[data-qa="login-email"]').clear().type(fxUser.invalid.email)
    cy.get('input[data-qa="login-password"]').clear().type(fxUser.invalid.password)
    cy.get('button[data-qa="login-button"]').click()

    // Assert error message
    cy.contains('p', 'Your email or password is incorrect!').should('be.visible')

    // Restore logged-in state for next tests
    cy.login(runtimeUser.email, runtimeUser.password, runtimeUser.name)
  })

  it('Checkout and assert order confirmation (happy path)', () => {
    cart.visit()

    // If cart is empty, add a product quickly
    cy.get('body').then(($body) => {
      const hasRows = $body.find('#cart_info_table tbody tr').length > 0
      if (!hasRows) {
        home.gotoProducts()
        cy.addToCart({ quantity: 1 })
        cart.visit()
      }
    })

    checkout.proceedToCheckout()

    // Assert presence of delivery/invoice address
    cy.contains('#address_delivery, #address_invoice', runtimeUser.firstName).should('exist')

    checkout.placeOrder()

    // Use a known-good fake card
    payment.pay(runtimeUser.name, '4111111111111111', '123', '12', '2030')
    payment.assertOrderPlaced()
  })

  it('Negative: payment fails with invalid card', () => {
    cart.visit()

    // Ensure at least one item exists
    cy.get('body').then(($body) => {
      if ($body.find('#cart_info_table tbody tr').length === 0) {
        home.gotoProducts()
        cy.addToCart({ quantity: 1 })
        cart.visit()
      }
    })

    checkout.proceedToCheckout()
    checkout.placeOrder()

    // Invalid card
    payment.pay(runtimeUser.name, '4000000000000002', '999', '01', '2026')

    // Expect an error message (site specific message may vary). Assert presence of any alert/danger
    cy.get('body').should(($b) => {
      const hasError = $b.find('.alert-danger, .error, .payment-errors, .alert').length > 0
      expect(hasError, 'some payment error visible').to.be.true
    })
  })
})
