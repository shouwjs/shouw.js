import * as fs from 'node:fs';
import * as path from 'node:path';
import { cyan } from 'chalk';
import { Collective } from '../utils';
import type { Functions } from '../core';
import type { ShouwClient } from './ShouwClient';

export class FunctionsManager extends Collective<string, Functions> {
    public readonly client: ShouwClient;

    constructor(client: ShouwClient) {
        super();
        this.client = client;
    }

    // LOAD FUNCTIONS FROM DIRECTORY
    public async load(basePath: string, debug: boolean) {
        const files = fs.readdirSync(basePath);
        for (const file of files) {
            const filePath = path.join(basePath, file);
            const stat = fs.lstatSync(filePath);
            if (stat.isDirectory()) {
                this.load(filePath, debug);
            } else if (file.endsWith('.js')) {
                try {
                    let RawFunction = require(filePath);
                    RawFunction = RawFunction ? (RawFunction?.default ?? RawFunction) : void 0;

                    if (!RawFunction) {
                        this.client.debug(`Function ${cyan(file)} has no default export`, 'WARN');
                        continue;
                    }

                    const func = new RawFunction();
                    this.create(func.name, func);
                    this.client.debug(`Function loaded: ${cyan(func.name)}`);
                } catch (err: any) {
                    this.client.debug(`Error in function ${cyan(file)}:\n${err.stack}`, 'ERROR');
                }
            }
        }
    }
}
