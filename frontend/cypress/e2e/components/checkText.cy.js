describe('tests for several interactions within check text', () => {

  const rootUrl = 'http://localhost:3000'

  beforeEach(() => {

    /* We have to first visit the wanted URL before each test is run */
    cy.visit(`${rootUrl}/checkText`)
  })

  it('Components rendered correctly and small interactions', () => {

    /* The navbar is rendered and has the right name */
    cy.get('[data-testid="navbar-component"]')
      .should('exist')
      .should('contain', 'NewsCop')

    /* Verify that the BodyCheckGeneric component is rendered with the correct description */
    cy.get('[data-testid="body-check-generic"]')
      .should('exist')
      .should('contain', 'News overlap checker') // First description
      .should('contain', 'Our tool detects overlap in your news article.') // Second Description

    /* Button is rendered correctly but is disabled */
    cy.get('[data-testid="submit_button"]')
      .should('exist')
      .and('be.disabled')

    /* Verify that the text area + the text above it are rendered correctly */
    cy.get('[data-testid="textAreaCheckOneText"]')
      .should('exist')
      .should('have.attr', 'placeholder', 'Enter your article here') // Placeholder value
      .should('have.value', '') // No text in the box currently
      .type('Example Test') // Write something in the box
      .should('have.value', 'Example Test') // See the text in the box changing

    /* The text above the box */
    cy.contains('h2', 'Enter the article’s content to check for overlap').should('exist');

    /* The error-prompt does not exist */
    cy.get('[data-testid="error-prompt"]')
      .should('not.exist')

    /* Check that the submit button is rendered and is not disabled*/
    cy.get('[data-testid="submit_button"]')
      .should('exist')
      // The button should not be disabled because there is text already in the box
      .and('not.be.disabled')
      .should('have.text', 'Submit')
      .click()

    /* The error-prompt exists and is visible */
    cy.get('[data-testid="error-prompt"]')
      .should('exist')
      .and('be.visible')
      .should('have.text', 'You entered an invalid text!')

    /* The button is temporarily disabled */
    cy.get('[data-testid="submit_button"]')
      .should('exist')
      .and('be.disabled')
      .wait(10000)
      .should('be.enabled')

    /* The error-prompt does not exist after timeout */
    cy.get('[data-testid="error-prompt"]')
      .should('not.exist')

    /* The footer is rendered correctly */
    cy.get('#footer')
      .should('exist')

    /* The loading circle should not exist */
    cy.get('[data-testid="loading-circle"]')
      .should('not.exist')

    /* The forward to page should exist */
    cy.get('[data-testid="forward-to-page"]')
      .should('exist')
      .should('have.text', '... or you may want to check a news article via an URL for similarity')

    /* The check decision should not be visible */
    cy.get('[data-testid="check-decision"]')
      .should('exist')
      .should('not.be.visible')
  })
  it('Redirect to checkURL page', () => {
    /* The forward to page should exist and small interaction */
    cy.get('[data-testid="forward-to-link"]')
      .should('exist')
      .click()
    cy.url()
      .should(
        'be.equal',
        `${rootUrl}/checkURL`)
  })

  it('Redirect to home page', () => {
    /* The forward to page should exist and small interaction */
    cy.get('[data-testid="to-home-page"]') // Go to the home page
      .should('exist')
      .click()
      .wait(100) // Wait a moment until everything is rendered
    cy.url()
      .should(
        'be.equal',
        `${rootUrl}/#home`) // We should now be in the homepage
  })

})

