/**
 * Test case for adockerNode.
 * Runs with mocha.
 */
'use strict'

const adockerNode = require('../lib/adocker_node.js')
const { ok, equal } = require('assert')
const asleep = require('asleep')

describe('adocker-node', function () {
  this.timeout(300000)

  it('Adocker node', async () => {
    let { logs, purge, build, run, remove, hasContainer, isRunning, exec } = adockerNode('testing-adocker-node', {
      image: 'node:8',
      tag: 'adocker-node-test',
      workdir: `${__dirname}/../misc/mocks/mock-project-01`,
      cmd: ['node', './bin/app.js']
    }).cli()
    ok(logs)
    ok(run)

    await build()
    await run()

    // ok(await hasContainer())
    // ok(await isRunning())

    await asleep(1000)

    await remove({ force: true })
  })
})

/* global describe, before, after, it */
