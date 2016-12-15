'use strict'

/* global beforeEach, cy */

function hasRaven (win) {
  return typeof win === 'object' && win.Raven
}

function sendTestInfo (spec) {
  // cannot use arrow function here, need full function with context
  beforeEach(function () {
    const testName = this &&
      this.currentTest && this.currentTest.fullTitle() || 'anonymous'
    const info = {testName}
    if (typeof spec === 'string') {
      info.spec = spec
    }

    // prepare for possible future Raven install
    cy.window()
      .then(w => {
        // we are not clearing the interval because the page
        // might be reloaded and the first Raven replaced with another one
        setInterval(() => {
          if (hasRaven(w)) {
            // TODO it would be more efficient to detect page reloads
            // and only then set the context again
            w.Raven
              .setExtraContext(info)
              .setTagsContext(info)
          }
        }, 5000)
      })
  })
}

module.exports = sendTestInfo
