const sendTestInfo = require('../..')
const immediate = true
const options = {
  spec: __filename,
  maxCheckTimes: 20,
  maxRavenInstalls: 2,
  interval: 1000,
  debug: true
}
if (!immediate) {
  sendTestInfo(options)
}

describe('Test page', function(){
  it('cy.should - assert that <title> is correct', function(){
    cy.visit(__dirname + '/../index.html')
    cy.title().should('eq', 'test')

    if (immediate) {
      options.immediate = true
      sendTestInfo(options)
    }

    console.log('sleeping for 15 seconds')
    cy.wait(15000)
  })
})
