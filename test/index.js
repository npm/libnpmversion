// just verify it sets up the default options correctly
const t = require('tap')
const requireInject = require('require-inject')
const index = requireInject('../lib/index.js', {
  '../lib/version.js': (newversion, opts) => [newversion, opts],
  '../lib/read-json.js': () => ({ name: 'package from rj' }),
})

t.cleanSnapshot = s => s.split(process.cwd()).join('{CWD}')

t.test('all the defaults', async t =>
  t.matchSnapshot(await index('from-git')))

t.test('set the package ahead of time', async t =>
  t.matchSnapshot(await index('major', {
    pkg: { name: 'package set in options' },
    path: '/some/path',
    cwd: 'different cwd, this should not show up',
    allowSameVersion: true,
    tagVersionPrefix: '=',
    commitHooks: false,
    gitTagVersion: false,
    signGitCommit: true,
    signGitTag: true,
    force: true,
    ignoreScripts: true,
    preid: 'rc',
    log: {},
    message: 'hello, i have a message for you',
    someOtherRandomField: 'this should not show up',
  })))
