/**
 * Collective to store temporary data, but with more features than a normal Map
 *
 * @class Collective
 * @extends Map
 */
export class Collective<K, V> extends Map<K, V> {
    /**
     * Create a new data
     *
     * @param {K} key
     * @param {V} value
     * @return {Collective<K, V>}
     */
    public create(key: K, value: V): Collective<K, V> {
        super.set(key, value);
        return this;
    }

    /**
     * Filtering values and returning a new array
     *
     * @param {Function} fn - The function to filter the values with
     * @return {V[]} - The filtered values
     */
    public filter(fn: (value: V, index: number, array: V[]) => boolean): V[] {
        return Array.from(this.V).filter(fn);
    }

    /**
     * Filtering keys and returning a new array
     *
     * @param {Function} fn - The function to filter the keys with
     * @return {K[]} - The filtered keys
     */
    public filterKeys(fn: (value: K, index: number, array: K[]) => boolean): K[] {
        return Array.from(this.K).filter(fn);
    }

    /**
     * Finding a value and returning it
     *
     * @param {Function} fn - The function to find the value with
     * @return {V | undefined} - The found value
     */
    public find(fn: (value: V, index: number, array: V[]) => boolean): V | undefined {
        return Array.from(this.V).find(fn);
    }

    /**
     * Finding a key and returning it
     *
     * @param {Function} fn - The function to find the key with
     * @return {K | undefined} - The found key
     */
    public findKey(fn: (value: K, index: number, array: K[]) => boolean): K | undefined {
        return Array.from(this.K).find(fn);
    }

    /**
     * Checking if some values are true and returning a boolean
     *
     * @param {Function} fn - The function to check the values with
     * @return {boolean} - The boolean value
     */
    public some(fn: (value: V, index: number, array: V[]) => boolean): boolean {
        return Array.from(this.V).some(fn);
    }

    /**
     * Checking if some keys are true and returning a boolean
     *
     * @param {Function} fn - The function to check the keys with
     * @return {boolean} - The boolean value
     */
    public someKeys(fn: (value: K, index: number, array: K[]) => boolean): boolean {
        return Array.from(this.K).some(fn);
    }

    /**
     * Checking if every value is true and returning a boolean
     *
     * @param {Function} fn - The function to check the values with
     * @return {boolean} - The boolean value
     */
    public every(fn: (value: V, index: number, array: V[]) => boolean): boolean {
        return Array.from(this.V).every(fn);
    }

    /**
     * Checking if every key is true and returning a boolean
     *
     * @param {Function} fn - The function to check the keys with
     * @return {boolean} - The boolean value
     */
    public everyKeys(fn: (value: K, index: number, array: K[]) => boolean): boolean {
        return Array.from(this.K).every(fn);
    }

    /**
     * Checking if a key exists and returning a boolean
     *
     * @param {K} key - The key to check
     * @return {boolean} - The boolean value
     */
    public has(key: K): boolean {
        return super.has(key);
    }

    /**
     * Getting all keys and returning them as an array
     *
     * @return {Array<K>} - The keys
     */
    public get K(): Array<K> {
        return [...this.keys()];
    }

    /**
     * Getting all values and returning them as an array
     *
     * @return {Array<V>} - The values
     */
    public get V(): Array<V> {
        return [...this.values()];
    }
}
