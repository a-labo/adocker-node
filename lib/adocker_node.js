/**
 * Define commands for docker node
 * @function adockerNode
 * @param {string} name - Container name
 * @param {Object} options - Optional settings
 * @returns {Object}
 */
'use strict'

const {
  logs, run, exec
} = require('adocker/commands')
const path = require('path')

const handleError = (err) => {
  console.error(err)
  process.exit(1)
}

/** @lends adockerNode */
function adockerNode (name, options = {}) {
  let {
    image = 'node:latest',
    onError = handleError,
    cwd = process.cwd(),
    srcDir = process.cwd(),
    NODE_ENV = 'development'
  } = options
  let bundle = {
    /**
     * Run script in node container
     * @param {string} script - Script path
     * @returns {Promise}
     */
    run: run.bind(null, {
      name,
      interactive: true,
      tty: true,
      rm: true,
      env: `NODE_ENV=${NODE_ENV}`,
      volume: `${path.resolve(srcDir)}:/usr/src/app`,
      workdir: 'usr/src/app'
    }, image),
    /**
     * Show logs of node container
     * @returns {Promise}
     */
    logs: logs.bind(null, name),
    /**
     * Open bash terminal on node container
     * @returns {Promise}
     */
    terminal: exec.bind(null, {
      interactive: true,
      tty: true
    }, name, 'bash')
  }
  return Object.assign(bundle, {
    cli () {
      return Object.assign({},
        ...Object.keys(bundle).map((name) => ({
          [name]: (...args) => {
            process.chdir(cwd)
            return bundle[ name ](...args).catch(onError)
          }
        }))
      )
    }
  })
}

module.exports = adockerNode
