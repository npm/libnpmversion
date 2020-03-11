const git = require('@npmcli/git')
const semver = require('semver')

module.exports = async (path, opts) => {
  const tag = (await git(['describe', '--abbrev=0'], opts)).stdout.trim()
  const match = tag.match(/v?(\d+\.\d+\.\d+(?:[-+].+)?)$/)
  if (match && semver.valid(match[1], { loose: true }))
    return semver.clean(match[1], { loose: true })

  throw new Error(`Tag is not a valid version: ${JSON.stringify(tag)}`)
}
