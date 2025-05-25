export class Collective<K, V> extends Map<K, V> {
    // ADD KEY AND VALUE TO MAP
    public create(key: K, value: V) {
        return super.set(key, value);
    }

    // FILTERING VALUES
    public filter(fn: (value: V, index: number, array: V[]) => V[]): V[] {
        return Array.from(this.V).filter(fn);
    }

    // FILTERING KEYS
    public filterKeys(fn: (key: K, index: number, array: K[]) => K[]): K[] {
        return Array.from(this.K).filter(fn);
    }

    // FINDING VALUE
    public find(fn: (value: V, index: number, array: V[]) => V | undefined): V | undefined {
        return Array.from(this.V).find(fn);
    }

    // SOME VALUE
    public some(fn: (value: V, index: number, array: V[]) => boolean): boolean {
        return Array.from(this.V).some(fn);
    }

    // CHECKING IF KEY EXISTS
    public has(key: K): boolean {
        return super.has(key);
    }

    // GETTING ALL KEYS
    public get K(): Array<K> {
        return [...this.keys()];
    }

    // GETTING ALL VALUES
    public get V(): Array<V> {
        return [...this.values()];
    }
}
