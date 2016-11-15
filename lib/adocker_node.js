/**
 * Define commands for docker node
 * @function adockerNode
 * @param {string} name - Container name
 * @param {Object} options - Optional settings
 * @returns {Object}
 */
'use strict'

const {
  logs, run, exec, build
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
    srcDir = process.cwd(),
    workdir = '/usr/src/app',
    NODE_ENV = 'development'
  } = options
  let bundle = {
    /** Build docker image */
    build: build.bind(null, tag, `
FROM ${image}
    
RUN mkdir -p ${workdir}
WORKDIR ${workdir}

COPY ${path.resolve(srcDir, 'package.json')} ${workdir}

RUN npm install pm2 -g
RUN npm install

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
      env: `NODE_ENV=${NODE_ENV}`,
      volume: `${path.resolve(srcDir)}:${workdir}`
    }, tag),
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
