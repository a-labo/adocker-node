'use strict'

const adockerNode = require('adocker-node')
const co = require('co')

const node = adockerNode({
  image: 'node:7',
  onError: (err) => {
    console.error(err)
    process.exit(1)
  },
  srcDir: '.'
})

co(function * () {

  let { run, exec } = node.cli()

  yield run()
}).catch((err) => console.error(err))
