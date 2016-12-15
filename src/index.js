'use strict'

/* global beforeEach, cy */

function hasRaven (win) {
  return typeof win === 'object' && win.Raven
}

function noop () {}

function sendTestInfo ({spec, interval, maxCheckTimes, maxRavenInstalls, debug}) {
  interval = interval || 5000
  maxCheckTimes = maxCheckTimes || 1000
  maxRavenInstalls = maxRavenInstalls || 10
  const log = debug ? console.log : noop

  // cannot use arrow function here, need full function with context
  beforeEach(function () {
    const testName = this &&
      this.currentTest && this.currentTest.fullTitle() || 'anonymous'
    const info = {testName}
    if (typeof spec === 'string') {
      info.spec = spec
    }
    log('Test info', info.testName)

    // prepare for possible future Raven install
    cy.window()
      .then(w => {
        let counter = 0
        let installedCounter = 0
        // we are not clearing the interval because the page
        // might be reloaded and the first Raven replaced with another one
        const handle = setInterval(() => {
          if (hasRaven(w)) {
            // TODO it would be more efficient to detect page reloads
            // and only then set the context again
            installedCounter += 1
            log('Found Raven on counter', counter,
              'will be install', installedCounter)
            w.Raven
              .setExtraContext(info)
              .setTagsContext(info)
            if (installedCounter >= maxRavenInstalls) {
              log('Found Raven desired number of times', maxRavenInstalls)
              log('Will no longer wait for it')
              clearInterval(handle)
              return
            }
          }
          counter += 1
          if (counter > maxCheckTimes) {
            log('Reached max checks for Raven', maxCheckTimes)
            clearInterval(handle)
          }
        }, interval)
      })
  })
}

module.exports = sendTestInfo
