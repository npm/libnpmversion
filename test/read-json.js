const t = require('tap')
const requireInject = require('require-inject')
const readJson = requireInject('../lib/read-json.js', {
  fs: {
    readFile: (path, enc, cb) => cb(null, data[path]),
  },
})
const obj = { a: 1, b: 2 }
const data = {
  crlf: JSON.stringify(obj, null, 2).replace(/\n/g, '\r\n') + '\r\n',
  lf: JSON.stringify(obj, null, 2) + '\n',
  oneline: JSON.stringify(obj) + '\n',
  onelineCrlf: JSON.stringify(obj) + '\r\n',
  nolf: JSON.stringify(obj),
  tab: JSON.stringify(obj, null, '\t') + '\n',
}

const exp = (indent, newline) => ({ indent, newline })
const expect = {
  crlf: exp('  ', '\r\n'),
  lf: exp('  ', '\n'),
  oneline: exp('', '\n'),
  onelineCrlf: exp('', '\n'),
  nolf: exp('', '\n'),
  tab: exp('\t', '\n'),
}

const kIndent = Symbol.for('indent')
const kNewline = Symbol.for('newline')

for (const path of Object.keys(data)) {
  t.test(path, async t => {
    const {
      [kIndent]: indent,
      [kNewline]: newline,
    } = await readJson(path)
    t.strictSame({ indent, newline }, expect[path])
  })
}
