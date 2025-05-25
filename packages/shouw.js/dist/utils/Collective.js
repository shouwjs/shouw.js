"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collective = void 0;
class Collective extends Map {
    // ADD KEY AND VALUE TO MAP
    create(key, value) {
        return super.set(key, value);
    }
    // FILTERING VALUES
    filter(fn) {
        return Array.from(this.V).filter(fn);
    }
    // FILTERING KEYS
    filterKeys(fn) {
        return Array.from(this.K).filter(fn);
    }
    // FINDING VALUE
    find(fn) {
        return Array.from(this.V).find(fn);
    }
    // SOME VALUE
    some(fn) {
        return Array.from(this.V).some(fn);
    }
    // CHECKING IF KEY EXISTS
    has(key) {
        return super.has(key);
    }
    // GETTING ALL KEYS
    get K() {
        return [...this.keys()];
    }
    // GETTING ALL VALUES
    get V() {
        return [...this.values()];
    }
}
exports.Collective = Collective;
