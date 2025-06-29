import {
    ShardingManager as DiscordShardingManager,
    type MultipleShardSpawnOptions,
    type Collection,
    type Shard
} from 'discord.js';
import chalk from 'chalk';

export interface ShardingOptions {
    file: string;
    token: string;
    totalShards?: number | 'auto';
    shardList?: number[] | 'auto';
    mode?: 'process' | 'worker';
    respawn?: boolean;
    silent?: boolean;
    shardArgs?: string[];
    execArgv?: string[];
    spawnOptions?: MultipleShardSpawnOptions;
}

/**
 * The ShardingManager class for the Shouw.js library. This class extends the discord.js ShardingManager class and adds some additional functionality.
 *
 * @class ShardingManager
 * @extends {import('discord.js').ShardingManager} - The discord.js ShardingManager class
 *
 * @param {ShardingOptions} options - The options for the sharding manager
 * @param {string} options.file - The file path where the bot is located
 * @param {string} options.token - The bot token
 * @param {number | 'auto'} [options.totalShards] - The total number of shards to spawn
 * @param {number[] | 'auto'} [options.shardList] - The list of shards to spawn
 * @param {'process' | 'worker'} [options.mode] - The mode to spawn the shards in
 * @param {boolean} [options.respawn] - Whether to respawn the shards if they crash
 * @param {boolean} [options.silent] - Whether to silence the shards
 * @param {string[]} [options.shardArgs] - The arguments to pass to the shards
 * @param {string[]} [options.execArgv] - The arguments to pass to the node process
 * @param {MultipleShardSpawnOptions} [options.spawnOptions] - The options for spawning the shards
 * @param {number} [options.spawnOptions.amount] - The amount of shards to spawn
 * @param {number} [options.spawnOptions.delay] - The delay between spawning shards
 * @param {number} [options.spawnOptions.timeout] - The timeout for spawning shards
 * @example new ShardingManager({ file: './dist/index.js', token: 'your-token-here' });
 */
export class ShardingManager extends DiscordShardingManager {
    constructor(public readonly options: ShardingOptions) {
        if (!options.token || typeof options.token !== 'string')
            throw new Error('Invalid bot token! Please provide a valid discord bot token!');
        if (!options.file || typeof options.file !== 'string')
            throw new Error('Invalid file path! Please provide a valid file path where the bot is located!');

        options.totalShards = options.totalShards ?? 'auto';
        options.shardList = options.shardList ?? 'auto';
        options.mode = options.mode ?? 'process';
        options.respawn = options.respawn ?? true;
        options.silent = options.silent ?? false;
        options.shardArgs = options.shardArgs ?? [];
        options.execArgv = options.execArgv ?? [];
        options.spawnOptions = options.spawnOptions ?? {};
        options.spawnOptions.amount = options.totalShards ?? 'auto';
        options.spawnOptions.delay = options.spawnOptions.delay ?? 5500;
        options.spawnOptions.timeout = options.spawnOptions.timeout ?? 30_000;

        super(options.file, options);
        this.options = options;
    }

    /**
     * Spawns the shards.
     *
     * @param {MultipleShardSpawnOptions} [options] - The options for spawning the shards
     * @returns {Promise<Collection<number, Shard>>} - The promise that resolves with the shards
     */
    public async spawn(options?: MultipleShardSpawnOptions): Promise<Collection<number, Shard>> {
        return super.spawn(options ?? this.options.spawnOptions);
    }

    /**
     * The event that is emitted when a shard is created.
     *
     * @param {(shard: Shard) => any} eventFunction - The function to run when the event is emitted
     * @returns {ShardingManager} - The sharding manager
     * @example <ShardingManager>.onShardCreate((shard) => {
     *     console.log(`Shard ${shard.id} created!`);
     * });
     */
    public onShardCreate(eventFunction: (shard: Shard, chalk: chalk.Chalk) => any | Promise<any>): ShardingManager {
        super.on('shardCreate', async (shard: Shard) => await eventFunction(shard, chalk));
        return this;
    }
}
