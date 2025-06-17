/**
 * Importing the ShardingManager class from the Shouw.js library
 */
const { ShardingManager } = require('../..');

/**
 * Creating a new sharding manager
 * @type {ShardingManager}
 */
new ShardingManager({
    file: 'tests/client/index.js',
    token: process.env.TOKEN,
    totalShards: 2,
    shardList: [0, 1]
});
