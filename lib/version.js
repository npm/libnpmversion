// called with all the options already set to their defaults

const retrieveTag = require('./retrieve-tag.js')
const semver = require('semver')
const enforceClean = require('./enforce-clean.js')
const writeJson = require('./write-json.js')
const readJson = require('./read-json.js')
const git = require('@npmcli/git')
const commit = require('./commit.js')
const tag = require('./tag.js')

const runScript = require('@npmcli/run-script')
const runner = opts => event => runScript({
  ...opts,
  stdio:
  'inherit',
  event,
})

module.exports = async (newversion, opts) => {
  const {
    path,
    allowSameVersion,
    tagVersionPrefix,
    commitHooks,
    gitTagVersion,
    signGitCommit,
    signGitTag,
    force,
    ignoreScripts,
    preid,
    pkg,
    log,
    message,
  } = opts

  const newV = semver.valid(newversion) ? newversion
    : newversion === 'from-git' ? await retrieveTag(opts)
    : semver.inc(pkg.version, newversion, preid)

  if (!newV) {
    throw Object.assign(new Error('Invalid version: ' + newversion), {
      current: pkg.version,
      requested: newversion,
    })
  }

  const currentClean = semver.clean(pkg.version)
  const newClean = semver.clean(newV)

  if (newClean === currentClean && !allowSameVersion) {
    throw Object.assign(new Error('Version not changed'), {
      current: pkg.version,
      requested: newversion,
      newVersion: newClean,
    })
  }

  const isGitDir = newversion === 'from-git' || await git.is({opts})

  // ok!  now we know the new version, and the old version is in pkg

  // - check if git dir is clean
  // returns false if we should not keep doing git stuff
  const doGit = isGitDir && await enforceClean(opts)
  if (isGitDir)
    await enforceClean(opts)

  const runScript = ignoreScripts ? () => {} : runner({
    ...opts,
    pkg,
    env: {
      npm_old_version: currentClean,
      npm_new_version: newClean,
    },
  })


  await runScript('preversion')

  // - update the files
  pkg.version = newClean
  delete pkg._id
  await writeJson(`${path}/package.json`, pkg)

  // try to update shrinkwrap, but ok if this fails
  const locks = [`${path}/package-lock.json`, `${path}/npm-shrinkwrap.json`]
  const haveLocks = []
  for (const lock of locks) {
    try {
      const sw = await readJson(lock)
      sw.version = newClean
      await writeJson(lock, sw)
      haveLocks.push(lock)
    } catch (er) {}
  }

  await runScript('version')

  if (doGit) {
    // - git add, git commit, git tag
    await git.spawn(['add', 'package.json', ...haveLocks], opts)
    await commit(newClean, opts)
    await tag(newClean, opts)
  } else
    log.verbose('version', 'Not tagging: not in a git repo or no git cmd')

  await runScript('postversion')
}
