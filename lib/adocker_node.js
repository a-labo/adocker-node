/**
 * Define commands for docker node
 * @function adockerNode
 * @param {string} name - Container name
 * @param {Object} options - Optional settings
 * @returns {Object}
 */
'use strict'

const {
  logs, run, exec, build, purge
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
    NODE_ENV = 'development'
  } = options
  let bundle = {
    /** Build docker image */
    build: build.bind(null, tag, `
FROM ${image}
    
RUN mkdir -p ${workdir}
WORKDIR ${workdir}

RUN npm install pm2 -g

CMD ["pm2-docker", "./bin/app.js"]
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
