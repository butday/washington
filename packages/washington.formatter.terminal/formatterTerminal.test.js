const Task = require('folktale/data/task')
const {green, grey, red, yellow} = require('chalk')
const formatterTerminal = require('./')

module.exports = [
  {
    it: 'prints a colorful output',
    when: check => {
      const suiteResult = [
        {
          it: 'testing',
          result: {
            type: 'success'
          }
        },
        {
          it: 'to be ignored',
          result: {
            type: 'pending'
          }
        },
        {
          it: 'fails',
          result: {
            type: 'failure',
            message: 'assertion error',
            stack: ['something', 'multiline']
          }
        }
      ]

      Task.of(suiteResult)
        .chain(formatterTerminal(check))
        .run()
    },
    shouldEqual:
      green('testing') + '\n' +
      yellow('to be ignored') + '\n' +
      red('fails\nassertion error\n  something\n  multiline') + '\n' +
      '\n' +
      green('1 successful') +
      grey(' • ') +
      yellow('1 pending') +
      grey(' • ') +
      red('1 failing')
  }
]
