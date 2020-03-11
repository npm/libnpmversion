const git = require('@npmcli/git')

module.exports = async opts => {
  const { force, log } = opts
  let hadError = false
  const clean = await git.isClean(opts).catch(er => {
    if (er.code === 'ENOGIT') {
      log.warn(
        'version',
        'This is a Git checkout, but the git command was not found.',
        'npm could not create a Git tag for this release!'
      )
      hadError = true
    } else
      throw er
  })

  if (!clean) {
    if (!force)
      throw new Error('Git working directory not clean.')
    log.warn(
      'version',
      'Git working directory not clean, proceeding forcefully.'
    )
  }

  return !hadError
}
