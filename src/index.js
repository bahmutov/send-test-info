'use strict'

/* global beforeEach, cy, Cypress */

function hasRaven (win) {
  return typeof win === 'object' && win.Raven
}

function noop () {}

function sendTestInfo ({
  spec, interval, maxCheckTimes, maxRavenInstalls, debug, immediate}) {
  interval = interval || 5000
  maxCheckTimes = maxCheckTimes || 1000
  maxRavenInstalls = maxRavenInstalls || 10
  const log = debug ? console.log : noop

  function getMochaTestTitle () {
    return this && this.currentTest && this.currentTest.fullTitle()
  }

  function getCypressTestTitle () {
    if (typeof cy !== 'object') {
      return
    }
    if (!cy.privates) {
      return
    }
    if (!cy.privates.runnable) {
      return
    }
    const runnable = cy.privates.runnable
    const ctx = runnable.ctx
    if (ctx) {
      return ctx.currentTest && ctx.currentTest.title
    }
    return runnable.title
  }

  function setupSendTestInfo () {
    const testName = getMochaTestTitle() ||
      getCypressTestTitle() || 'anonymous'

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
        let prevRaven
        const handle = setInterval(() => {
          counter += 1

          if (hasRaven(w)) {
            // TODO it would be more efficient to detect page reloads
            // and only then set the context again
            if (w.Raven === prevRaven) {
              log('Raven reference already seen')
            } else {
              prevRaven = w.Raven

              installedCounter += 1
              log('Found Raven on counter', counter,
                'will be install', installedCounter)
              w.Raven
                .setExtraContext(info)
                .setTagsContext(info)

              // using "all" records all events
              // for now record just most common ones
              const events = ['log', 'log:state:changed', 'test:after:run']
              events.forEach(eventName => {
                Cypress.on(eventName, function (obj) {
                  // only record useful properties
                  const data = Cypress._.pick(obj,
                    'name', 'err', 'instrument', 'url', 'hookName',
                    'consoleProps', 'state', 'renderProps', 'message',
                    'expected', 'actual',
                    'viewportWidth', 'viewportHeight')

                  const message = eventName
                  const category = 'Cypress'
                  w.Raven.captureBreadcrumb({message, category, data})
                })
              })

              if (installedCounter >= maxRavenInstalls) {
                log('Found Raven desired number of times', maxRavenInstalls)
                log('Will no longer wait for it')
                clearInterval(handle)
                return
              }
            }
          }

          if (counter > maxCheckTimes) {
            log('Reached max checks for Raven', maxCheckTimes)
            clearInterval(handle)
          }
        }, interval)
      })
  }

  if (immediate) {
    log('Immediate Raven setup without going through beforeEach')
    setupSendTestInfo()
  } else {
    // cannot use arrow function here, need full function with context
    beforeEach(setupSendTestInfo)
  }
}

module.exports = sendTestInfo
