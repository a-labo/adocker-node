/**
 * Test case for adockerNode.
 * Runs with mocha.
 */
'use strict'

const adockerNode = require('../lib/adocker_node.js')
const assert = require('assert')
const co = require('co')

describe('adocker-node', function () {
  this.timeout(3000)

  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('Adocker node', () => co(function * () {
    let { logs, run } = adockerNode({}).cli()
    assert.ok(logs)
    assert.ok(run)
  }))
})

/* global describe, before, after, it */
