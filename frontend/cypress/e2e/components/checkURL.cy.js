describe('template spec & clicking a button after inputting some text', () => {

    const HOST = 'http://localhost:3000' // TODO: put the actual URL after we deploy our app on Heroku

  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
    cy.visit(`${HOST}/checkURL`) 
  })

  it('Basic rendering tests', () => {
    // Verify that the NavbarComponent is rendered with the correct applicationName
    cy.get('[data-testid="navbar-component"]')
      .should('exist')
      .should('contain', 'NewsCop')

    // Verify that the BodyCheckGeneric component is rendered with the correct description
    cy.get('[data-testid="body-check-generic"]')
      .should('exist')
      .should('contain', 'News overlap checker')

    // Interact with the EnterURL component (e.g., type text in input fields and click buttons)
    cy.get('[data-testid="enter-url"]')
      .should('exist')
      .within(() => {
        // Type a URL in the input field
        cy.get('#formUrl').type('https://example.com')

        // Click a button to submit the URL
        cy.get('button').click()
      })

    // Verify that the Footer component is rendered
    cy.get('#footer') // This one already had an `id` that I decided to use
      .should('exist')
  })
  it('Being redirected to checkText', () => {
    
    cy.get('[data-testid="forward-to-page"]')
      .should('exist')
      .click()

    cy.url()
    .should(
      'be.equal',
      `${HOST}/checkText`)
      
  })
})

