/**
 * Define commands for docker node
 * @function adockerNode
 * @param {string} name - Container name
 * @param {Object} options - Optional settings
 * @returns {Object}
 */
'use strict'

const {
  logs, run, remove, exec,
  build, purge,
  inspect
} = require('adocker/commands')
const { EOL } = require('os')
const path = require('path')

const handleError = (err) => {
  console.error(err)
  process.exit(1)
}

/** @lends adockerNode */
function adockerNode (name, options = {}) {
  const WORKDIR = '/usr/src/app'
  let {
    tag = 'myapp',
    image = 'node:latest',
    onError = handleError,
    cwd = process.cwd(),
    network = 'default',
    publish = false,
    mountDir = process.cwd(),
    NODE_ENV = 'production',
    aptModules = [],
    npmGlobalModules = [ 'yarn', 'pon', 'pm2' ],
    run: runLines = [],
    cmd = [ 'pm2-docker', './bin/app.js' ]
  } = options

  let bundle = {
    /** Build docker image */
    build: build.bind(null, tag, `

FROM ${image}
    
RUN mkdir -p ${WORKDIR}
WORKDIR ${WORKDIR}

RUN apt-get update -y
${(aptModules.length > 0 ? `RUN apt-get install ${aptModules.join(' ')} -y` : '')}
${(npmGlobalModules.length > 0 ? `RUN npm install ${npmGlobalModules.join(' ')} -g` : '')}

${runLines.map((run) => `RUN ${run};`).join(EOL)}

CMD ${JSON.stringify(cmd)}

`.trim()),
    /**
     * Run script in node container
     * @param {...string} script - Script path
     * @returns {Promise}
     */
    run: run.bind(null, {
      name,
      publish,
      // rm: true,
      detach: true,
      workdir: WORKDIR,
      network,
      env: `NODE_ENV=${NODE_ENV}`,
      volume: [
        `${path.resolve(mountDir)}:${WORKDIR}`
      ].filter(Boolean)
    }, tag),
    /**
     * Running or not
     * @returns {Promise}
     */
    isRunning: () => inspect(name).then(([ info ]) => Boolean(info && info.State.Running)),
    /**
     * Has build image or not
     * @returns {Promise}
     */
    hasContainer: () => inspect(name).then(([ info ]) => !!info),
    /**
     * Remove nginx container
     * @param {Object} [options={}] - Optional settings
     * @param {boolean} [options.force=false] - Force to remove
     * @returns {Promise}
     */
    remove: remove.bind(null, name),
    /**
     * Purge build image
     * @returns {Promise}
     */
    purge: purge.bind(null, tag),
    /**
     * Show logs of node container
     * @returns {Promise}
     */
    logs: logs.bind(null, name),
    /**
     * Execute script on node container
     * @param {...string} script - Script path
     * @returns {Promise}
     */
    exec: exec.bind(null, {
      interactive: false,
      tty: false
    }, name),
    /**
     * Open bash terminal on node container
     * @param {...string} script - Script path
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
