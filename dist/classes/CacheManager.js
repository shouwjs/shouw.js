"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheManager = void 0;
const Collective_js_1 = require("../utils/Collective.js");
class CacheManager {
    #cache;
    client;
    constructor(client) {
        this.client = client;
        this.#cache = {};
    }
    get cache() {
        return this.#cache;
    }
    createCache(name) {
        this.cache[name] = new Collective_js_1.Collective();
        return this.#cache[name];
    }
    getCache(name) {
        return this.cache[name];
    }
    deleteCache(name) {
        delete this.cache[name];
    }
    hasCache(name) {
        return Object.hasOwn(this.cache, name);
    }
    get cacheNames() {
        return Object.keys(this.cache);
    }
    get caches() {
        return Object.values(this.cache);
    }
    get(name, key) {
        return this.cache[name]?.get(key);
    }
    set(name, key, value) {
        return this.cache[name]?.set(key, value) ?? void 0;
    }
    delete(name, key) {
        return this.cache[name]?.delete(key) ?? false;
    }
    clear(name) {
        this.cache[name]?.clear();
    }
    has(name, key) {
        return this.cache[name]?.has(key) ?? false;
    }
    size(name) {
        return this.cache[name]?.size ?? 0;
    }
    keys(name) {
        return this.cache[name]?.K ?? [];
    }
    values(name) {
        return this.cache[name]?.V ?? [];
    }
}
exports.CacheManager = CacheManager;
