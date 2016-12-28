const sendTestInfo = require('../..')
const options = {
  spec: __filename,
  maxCheckTimes: 20,
  maxRavenInstalls: 2,
  interval: 1000,
  debug: true,
  immediate: true
}

describe('Test page (immediate registration)', function(){
  it('cy.should - assert that <title> is correct', function(){
    cy.visit(__dirname + '/../index.html')

    sendTestInfo(options)

    cy.wait(1000)

    console.log('checking the page title')
    cy.title().should('eq', 'test')

    console.log('sleeping for 15 seconds')
    cy.wait(15000)
  })
})
