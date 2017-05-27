/**
 * Test case for adockerNode.
 * Runs with mocha.
 */
'use strict'

const adockerNode = require('../lib/adocker_node.js')
const { ok, equal } = require('assert')
const asleep = require('asleep')
const co = require('co')

describe('adocker-node', function () {
  this.timeout(300000)

  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('Adocker node', () => co(function * () {
    let { logs, build, run, remove } = adockerNode({
      tag: 'adocker-node-test',
      workdir: `${__dirname}/../misc/mocks/mock-project-01`,
      cmd: [ 'node', './bin/app.js' ]
    }).cli()
    ok(logs)
    ok(run)

    yield build()
    yield run()

    yield asleep(1000)

    yield remove({ force: true })
  }))
})

/* global describe, before, after, it */
