// Washington
// ==========
//
// > Little George sets a good example
//
// [ ![Codeship Status for xaviervia/washington](https://codeship.io/projects/b9498dd0-d7b0-0131-28b3-76d451bab93b/status)](https://codeship.io/projects/23932)
//
// Example library for TDD/BDD in Node.js.
// Very small. Much concise.
//
// - No assertions. Use `assert`
// - Stupidly simple async support
// - Programmatically usable report (`washington.report.failures().length`)
//
// Installation
// ------------
//
// ```
// npm install washington
// ```
//
// Usage
// -----
//
// ```javascript
// var example = require("washington")
// var assert  = require("assert")
//
// example("2 + 2 should be 4", function () {
//   assert.equal(2 + 2, 4)
// })
//
// example.go()
// ```
//
// #### Arguments
//
// - `String` description
// - `Function` example
//
"use strict"

var mediator   = require("./src/mediator")
var Formatter  = require("./src/formatter")

var Washington = function (message, func) {

  //! Washington is being instantiated
  if (this instanceof Washington) {

    //! Assign the properties
    this.message  = message
    this.function = func

    //! Add the example to the list
    Washington.list = Washington.list || []
    Washington.list.push(this)

  }

  //! Washington is being called as a function
  else

    //! So we should return a new instance
    return new Washington(message, func)

}

//
// #### Events
//
// ##### `complete`
//
// Fires whenever the full report is ready.
//
// **Arguments for callback:**
//
// - `Washington.Report` report
// - `Integer` exitCode
//
// **Sample:**
//
// ```javascript
// washington.on("complete", function (report, code) {
//
//   // Log the results by hand
//   console.log("Successful: " + report.successful().length)
//   console.log("Pending: " + report.pending().length)
//   console.log("Failing: " + report.failing().length)
//
//   // Use the exit code to propagate failing status
//   process.exit(code)
//
// })
// ```
//
// ##### `example`
//
// ##### `success`
//
// ##### `failure`
//
// ##### `pending`
//
// ##### `timeout`
//
//
// API
// ---

Washington.on = mediator.on

Washington.off = mediator.off

Washington.trigger = mediator.trigger

Washington.release = mediator.release

Washington.use = function (formatter) {
  if (Washington.formatter)
    Washington.off(Washington.formatter)

  try {
    Object.keys(formatter)
    Washington.on(formatter)
    Washington.formatter = formatter
  }

  catch (notObject) {
    Washington.formatter = null
  }
}

Washington.go = function () {
  Washington.list.forEach(function (example) {
    if (example.run === Washington.prototype.run)
      example.run()
  })
}

Washington.successful = function () {
  return Washington.list.filter(function (example) {
    return example instanceof Washington.Success
  })
}

Washington.failing = function () {
  return Washington.list.filter(function (example) {
    return example instanceof Washington.Failure
  })
}

Washington.pending = function () {
  return Washington.list.filter(function (example) {
    return example instanceof Washington.Pending
  })
}

Washington.reset = function () {
  Washington.list      = null
  Washington.listeners = null
  Washington.use(Formatter)

  Washington.on("example", function () {
    if (Washington.list.filter(function (example) {
          return example instanceof Washington
        }).length == 0)
      Washington.trigger(
        "complete",
        [
          Washington,
          Washington.failing().length
        ]
      )
  })
}

Washington.prototype.run = function () {
  var replacement

  if (this.function) {
    try {
      this.function()
      replacement = this.succeeded()
    }
    catch (error) {
      replacement = this.failed(error)
    }
  }

  else
    replacement = this.pending()

  Washington.trigger('example', [replacement, Washington])
  return replacement
}

Washington.prototype.succeeded = function () {
  var success = new Washington.Success(this)
  var current = this
  Washington.list = Washington.list.map(function (example) {
    return example === current ? success : example
  })
  Washington.trigger('success', [success, Washington])
  return success
}

Washington.prototype.failed = function (error) {
  var failure = new Washington.Failure(this, error)
  var current = this
  Washington.list = Washington.list.map(function (example) {
    return example === current ? failure : example
  })
  Washington.trigger('failure', [failure, Washington])
  return failure
}

Washington.prototype.pending = function () {
  var pending = new Washington.Pending(this)
  var current = this
  Washington.list = Washington.list.map(function (example) {
    return example === current ? pending : example
  })
  Washington.trigger('pending', [pending, Washington])
  return pending
}

Washington.Success = require("./src/success")
Washington.Failure = require("./src/failure")
Washington.Pending = require("./src/pending")

Washington.reset()

module.exports = Washington
