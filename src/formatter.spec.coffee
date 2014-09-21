formatter  = require "./formatter"
assert     = require "assert"

RED        = "\u001b[31m"
GREEN      = "\u001b[32m"
YELLOW     = "\u001b[33m"
CLEAR      = "\u001b[0m"
BOLD       = "\u001b[1m"
GREY       = "\u001b[30m"

log        = (message)->
  console.log BOLD + message + CLEAR

hijack     = {}

jack       = (object, method, mock)->
  hijack[method] = object[method]
  object[method] = mock

unjack     = (object, method)->
  object[method] = hijack[method]

pending    = (reason)->
  throw new Error(reason)

################################################################################

log "Should log to info in green and nice whenever a success occurs and duration in grey"

flag         = false
message      = "This will succeed"

jack console, "info", (content)->
  assert.equal content,
               GREEN + " ✌ " + message + CLEAR + GREY + " (34ms)" + CLEAR
  flag = true

formatter.success
  message: "This will succeed"
  duration: -> 34

assert.equal flag, true

unjack hijack, "info"

################################################################################

log "Should log to warn in yellow and normal whenever a pending occurs"

flag         = false
message      = "This is pending"

jack console, "warn", (content)->
  assert.equal content,
               YELLOW + " ✍ " + message + CLEAR
  flag = true

formatter.pending
  message: "This is pending"

assert.equal flag, true

unjack hijack, "warn"

################################################################################

log "Should log to error in red and harsh whenever a failure occurs and duration in grey"

flag         = false
message      = "This fails"
error        = new Error "This should be there"

jack console, "error", (content)->
  assert.equal content,
               RED + " ☞ " + message + CLEAR + GREY + " (56ms)" + CLEAR + RED + "\n ☞ " + error.stack + CLEAR
  flag = true

formatter.failure
  message: "This fails"
  error: error
  duration: -> 56

assert.equal flag, true

unjack hijack, "error"

################################################################################

log "Complete should list colored the successes, pending and failures and duration"

flag         = false

jack process, "exit", ->
jack console, "log", (content)->
  assert.equal content,
               RED + "3 failing" + CLEAR + " ∙ " +
               YELLOW + "2 pending" + CLEAR + " ∙ " +
               GREEN + "5 successful" + CLEAR + GREY + " (45ms)" + CLEAR
  flag = true

formatter.complete
  successful:  -> [1, 2, 3, 4, 5]
  pending:     -> [1, 2]
  failing:     -> [1, 2, 3]
  duration:    -> 
    45
  , 0

assert.equal flag, true

unjack process, "exit"
unjack console, "log"

################################################################################

log "Complete should list colored the successful and pending and duration"

flag         = false

jack process, "exit", ->
jack console, "log", (content)->
  assert.equal content,
               YELLOW + "2 pending" + CLEAR + " ∙ " +
               GREEN + "5 successful" + CLEAR + GREY + " (67ms)" + CLEAR
  flag = true

formatter.complete
  successful:  -> [1, 2, 3, 4, 5]
  pending:     -> [1, 2]
  failing:     -> []
  duration:    -> 
    67
  , 0

assert.equal flag, true

unjack process, "exit"
unjack console, "log"

################################################################################

log "Complete should list colored the successful and duration in grey"

flag         = false

jack process, "exit", ->
jack console, "log", (content)->
  assert.equal content,
               GREEN + "5 successful" + CLEAR + GREY + " (98ms)" + CLEAR
  flag = true

formatter.complete
  successful:  -> [1, 2, 3, 4, 5]
  pending:     -> []
  failing:     -> []
  duration:    -> 
    98
  , 0

assert.equal flag, true

unjack process, "exit"
unjack console, "log"

################################################################################

log "Complete should list colored the failing and duration in grey"

flag         = false

jack process, "exit", ->
jack console, "log", (content)->
  assert.equal content,
               RED + "5 failing" + CLEAR + GREY + " (12ms)" + CLEAR
  flag = true

formatter.complete
  successful:  -> []
  pending:     -> []
  failing:     -> [1, 2, 3, 4, 5]
  duration:    -> 
    12
  , 0

assert.equal flag, true

unjack process, "exit"
unjack console, "log"

################################################################################

log "Complete should list colored the pending"

flag         = false

jack process, "exit", ->
jack console, "log", (content)->
  assert.equal content,
               YELLOW + "5 pending" + CLEAR
  flag = true

formatter.complete
  successful:  -> []
  pending:     -> [1, 2, 3, 4, 5]
  failing:     -> []
  duration:    -> 
    0
  , 0

assert.equal flag, true

unjack process, "exit"
unjack console, "log"

################################################################################

log "Should exit with status 0 when the code is 0"

flag         = false
dummyReport  =
  successful: ->
    []
  pending: ->
    []
  failing: ->
    []
  duration: -> 
    0

jack console, "log", ->
jack process, "exit", (code)->
  assert.equal code, 0
  flag = true

formatter.complete dummyReport, 0

assert.equal flag, true

unjack process, "exit"
unjack console, "log"

################################################################################

log "Should exit with status two if there are two failures"

flag         = false

jack console, "log", ->
jack process, "exit", (code)->
  assert.equal code, 2
  flag = true

formatter.complete dummyReport, 2

assert.equal flag, true

unjack process, "exit"
unjack console, "log"
