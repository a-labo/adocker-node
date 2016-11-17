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
const path = require('path')

const handleError = (err) => {
  console.error(err)
  process.exit(1)
}

/** @lends adockerNode */
function adockerNode (name, options = {}) {
  let {
    tag = 'myapp',
    image = 'node:latest',
    onError = handleError,
    cwd = process.cwd(),
    network = 'default',
    workdir = '/usr/src/app',
    volumes = { [process.cwd()]: workdir },
    NODE_ENV = 'development',
    aptModules = [],
    npmGlobalModules = [ 'pm2' ],
    cmd = [ 'pm2-docker', './bin/app.js' ]
  } = options

  let bundle = {
    /** Build docker image */
    build: build.bind(null, tag, `
FROM ${image}
    
RUN mkdir -p ${workdir}
WORKDIR ${workdir}

RUN apt-get update -y
${(aptModules.length > 0 ? `RUN apt-get install ${aptModules.join(' ')} -y` : '')}
${(npmGlobalModules.length > 0 ? `RUN npm install ${npmGlobalModules.join(' ')} -g` : '')}

CMD ${JSON.stringify(cmd)}
`),
    /**
     * Run script in node container
     * @param {...string} script - Script path
     * @returns {Promise}
     */
    run: run.bind(null, {
      name,
      interactive: true,
      tty: true,
      rm: true,
      workdir,
      network,
      env: `NODE_ENV=${NODE_ENV}`,
      volume: Object.keys(volumes).reduce((result, src) => {
        let volume = `${path.resolve(cwd, src)}:${path.resolve(workdir, volumes[ src ])}`
        return result.concat(volume)
      }, [])
    }, tag),
    /**
     * Running
     * @returns {Promise}
     */
    isRunning: () => inspect(name).then(([info]) => !!info),
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
      interactive: true,
      tty: true
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
