/**
 * Docker Node.js
 * @module adocker-node
 * @version 2.0.1
 */

'use strict'

const adockerNode = require('./adocker_node')

let lib = adockerNode.bind(this)

Object.assign(lib, adockerNode, {
  adockerNode
})

module.exports = lib
