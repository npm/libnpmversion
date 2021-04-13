const {spawn} = require('@npmcli/git')
const semver = require('semver')

module.exports = async opts => {
  const tag = (await spawn(['describe', '--tags', '--abbrev=0',  '--match=\'*.*.*\''], opts)).stdout.trim()
  // XXX this "v?" is either wrong or spurious, because `tagVersionPrefix` can
  // be anything
  const match = tag.match(/v?(\d+\.\d+\.\d+(?:[-+].+)?)/)
  const ver = match && semver.clean(match[1], { loose: true })
  if (ver)
    return ver
  throw new Error(`Tag is not a valid version: ${JSON.stringify(tag)}`)
}
