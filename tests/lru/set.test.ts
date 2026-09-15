import { describe, it, expect } from '@jest/globals';
import { Set } from '../../src/lru/set';
import { Comparable } from '../../src/set/comparable.interface';

class NumberComparable implements Comparable {
	public value: number;

	constructor(value: number) {
		this.value = value;
	}

	public compareTo(other: NumberComparable): number {
		return this.value - other.value;
	}
}

describe('LRU Set', () => {
	it('should initialize with specific capacity', () => {
		const lru = new Set<NumberComparable>(3);
		expect(lru.capacity).toBe(3);
		expect(lru.length).toBe(0);
	});

	it('should add items and evict least recently used when over capacity', () => {
		const lru = new Set<NumberComparable>(3);
		const node1 = new NumberComparable(1);
		const node2 = new NumberComparable(2);
		const node3 = new NumberComparable(3);
		const node4 = new NumberComparable(4);

		lru.add(node1);
		lru.add(node2);
		lru.add(node3);

		expect(lru.length).toBe(3);

		// The LRU is node1, so it should be evicted when node4 is added
		let evicted: NumberComparable | undefined;
		lru.add(node4, 0, undefined, (node) => { evicted = node; });

		expect(evicted).toBe(node1);
		expect(lru.length).toBe(3);
		expect(lru.indexOf(node1)).toBe(-1);
		expect(lru.indexOf(node4)).toBeGreaterThan(-1);
	});

	it('should promote an item to MRU on get', () => {
		const lru = new Set<NumberComparable>(3);
		const node1 = new NumberComparable(1);
		const node2 = new NumberComparable(2);
		const node3 = new NumberComparable(3);
		const node4 = new NumberComparable(4);

		lru.add(node1);
		lru.add(node2);
		lru.add(node3);

		// Access node1, promoting it to MRU (head)
		const index = lru.indexOf(node1);
		const result = lru.get(index);
		expect(result).toBe(node1);

		// Now node2 is the LRU, so it gets evicted
		lru.add(node4);

		expect(lru.indexOf(node2)).toBe(-1);
		expect(lru.indexOf(node1)).toBeGreaterThan(-1); // protected from eviction
	});

	it('should support replace with put', () => {
		const lru = new Set<NumberComparable>(3);
		const node1 = new NumberComparable(1);
		const node2 = new NumberComparable(2);
		lru.add(node1);
		lru.add(node2);

		// Replace node1
		const node1New = new NumberComparable(1);
		let evicted: NumberComparable | undefined;
		lru.put(node1New, 0, undefined, (current) => current?.value === 1, (node) => { evicted = node; });

		expect(lru.length).toBe(2);
		expect(evicted).toBeUndefined(); // It was a replacement, not an eviction

		const idx = lru.indexOf(node1New);
		expect(lru.get(idx)).toBe(node1New);
	});

	it('should remove items correctly', () => {
		const lru = new Set<NumberComparable>(3);
		const node1 = new NumberComparable(1);
		lru.add(node1);

		expect(lru.length).toBe(1);
		const removed = lru.remove(node1);

		expect(lru.length).toBe(0);
		expect(removed.length).toBe(1);
		expect(removed.indexOf(node1)).toBeGreaterThan(-1);
	});

	it('should iterate over items in order', () => {
		const lru = new Set<NumberComparable>(3);
		lru.add(new NumberComparable(1));
		lru.add(new NumberComparable(2));

		let items: number[] = [];
		lru.forEach((comparable) => {
			items.push(comparable.value);
		});

		// Sets typically store in sorted order of compareTo
		expect(items).toEqual([1, 2]);
	});
});
