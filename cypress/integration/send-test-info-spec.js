const sendTestInfo = require('../..')
sendTestInfo(__filename)

describe('Test page', function(){
  it('cy.should - assert that <title> is correct', function(){
    cy.visit(__dirname + '/../index.html')
    cy.title().should('eq', 'test')
    console.log('sleeping for 15 seconds')
    cy.wait(15000)
  })
})
