import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Set } from '../../../src/lru/ttl/set';
import { Comparable } from '../../../src/set/comparable.interface';

class NumberComparable implements Comparable {
	public value: number;

	constructor(value: number) {
		this.value = value;
	}

	public compareTo(other: NumberComparable): number {
		return this.value - other.value;
	}
}

describe('LRU TTL Set', () => {

	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('should initialize with capacity and ttl', () => {
		const lru = new Set<NumberComparable>(3, 1000);
		expect(lru.length).toBe(0);
	});

	it('should initialize with variadic args', () => {
		const a = new NumberComparable(1);
		const b = new NumberComparable(2);
		const lru = new Set<NumberComparable>(3, 1000, a, b);
		expect(lru.length).toBe(2);
		expect(lru.indexOf(a)).toBe(0); // set is [1,2], a=1 is at index 0
		expect(lru.indexOf(b)).toBe(1); // set is [1,2], b=2 is at index 1
	});

	it('should add items and respect capacity (LRU eviction)', () => {
		const lru = new Set<NumberComparable>(3, 10000);
		const n1 = new NumberComparable(1);
		const n2 = new NumberComparable(2);
		const n3 = new NumberComparable(3);
		const n4 = new NumberComparable(4);

		lru.add(n1);
		lru.add(n2);
		lru.add(n3);
		expect(lru.length).toBe(3);

		lru.add(n4);
		// n1 was LRU (oldest in TTL list = head), should be evicted
		expect(lru.length).toBe(3);
		expect(lru.indexOf(n1)).toBe(-1);
		expect(lru.indexOf(n4)).toBe(2); // set is [2,3,4] after eviction of n1

		lru.destroy();
	});

	it('should expire items automatically after TTL', () => {
		const lru = new Set<NumberComparable>(5, 500);
		const n1 = new NumberComparable(1);
		const n2 = new NumberComparable(2);
		lru.add(n1);
		lru.add(n2);
		expect(lru.length).toBe(2);

		jest.advanceTimersByTime(600);

		expect(lru.length).toBe(0);
		expect(lru.indexOf(n1)).toBe(-1);
		expect(lru.indexOf(n2)).toBe(-1);

		lru.destroy();
	});

	it('should not expire items before TTL', () => {
		const lru = new Set<NumberComparable>(5, 1000);
		const n1 = new NumberComparable(1);
		lru.add(n1);

		jest.advanceTimersByTime(500);

		expect(lru.length).toBe(1);
		expect(lru.indexOf(n1)).toBe(0); // only element [1], at index 0

		lru.destroy();
	});

	it('should remove items manually', () => {
		const lru = new Set<NumberComparable>(3, 10000);
		const n1 = new NumberComparable(1);
		const n2 = new NumberComparable(2);
		lru.add(n1);
		lru.add(n2);
		expect(lru.length).toBe(2);

		const removed = lru.remove(n1);
		expect(lru.length).toBe(1);
		expect(lru.indexOf(n1)).toBe(-1);
		expect(removed.length).toBe(1);
		expect(removed.indexOf(n1)).toBe(0); // only element in the removed set

		lru.destroy();
	});

	it('should replace with put', () => {
		const lru = new Set<NumberComparable>(3, 10000);
		const n1 = new NumberComparable(1);
		const n2 = new NumberComparable(2);
		lru.add(n1);
		lru.add(n2);

		const n1New = new NumberComparable(1);
		lru.put(n1New, 0, undefined, (current) => current?.value === 1);

		expect(lru.length).toBe(2);
		const idx = lru.indexOf(n1New);
		expect(lru.get(idx)).toBe(n1New);

		lru.destroy();
	});

	it('should iterate via forEach in sorted order', () => {
		const lru = new Set<NumberComparable>(5, 10000);
		lru.add(new NumberComparable(3));
		lru.add(new NumberComparable(1));
		lru.add(new NumberComparable(2));

		const items: number[] = [];
		lru.forEach((c) => items.push(c.value));

		expect(items).toEqual([1, 2, 3]);

		lru.destroy();
	});

	it('should expire items in batches when multiple TTLs fire', () => {
		const lru = new Set<NumberComparable>(10, 500);
		const n1 = new NumberComparable(1);
		const n2 = new NumberComparable(2);
		const n3 = new NumberComparable(3);

		lru.add(n1);
		lru.add(n2);

		jest.advanceTimersByTime(600); // n1 and n2 expire

		expect(lru.length).toBe(0);

		lru.add(n3); // new item, fresh TTL
		expect(lru.length).toBe(1);
		expect(lru.indexOf(n3)).toBe(0); // only element [3], at index 0

		lru.destroy();
	});

	it('should clear the timer on destroy', () => {
		const lru = new Set<NumberComparable>(3, 500);
		lru.add(new NumberComparable(1));

		lru.destroy();

		// After destroy, advancing timers should not cause errors or trigger expiry
		jest.advanceTimersByTime(1000);
		// No assertions needed - the test just validates no exception is thrown
	});

	it('get should reset TTL: element accessed just before expiry should survive a full TTL period', () => {
		const lru = new Set<NumberComparable>(5, 1000);
		const n1 = new NumberComparable(1);
		const n2 = new NumberComparable(2);
		lru.add(n1);
		lru.add(n2);

		// Advance to just before n1 would expire
		jest.advanceTimersByTime(900);

		// Access n1 via get — should reset its TTL to now + 1000ms
		const idx = lru.indexOf(n1);
		const result = lru.get(idx);
		expect(result).toBe(n1);

		// Advance another 600ms: original TTL of n1 would have expired (900+600=1500 > 1000)
		// but since we reset it, n1 should still be alive
		jest.advanceTimersByTime(600);

		expect(lru.indexOf(n1)).toBe(0); // n1 survived because TTL was reset
		expect(lru.indexOf(n2)).toBe(-1); // n2 expired (900+600 = 1500ms > 1000ms TTL)

		lru.destroy();
	});

	it('get should move the element to be the last to expire among current entries', () => {
		const lru = new Set<NumberComparable>(5, 1000);
		const n1 = new NumberComparable(1);
		const n2 = new NumberComparable(2);
		const n3 = new NumberComparable(3);
		lru.add(n1);
		lru.add(n2);
		lru.add(n3);

		// Advance 600ms, then access n1 — it should be pushed to the back of the TTL queue
		jest.advanceTimersByTime(600);
		const idx = lru.indexOf(n1);
		lru.get(idx);

		// At 1100ms: n2 and n3 expire (original TTL 1000ms), n1 is still alive (reset at 600ms, expires at 1600ms)
		jest.advanceTimersByTime(500); // total: 1100ms

		expect(lru.indexOf(n2)).toBe(-1);
		expect(lru.indexOf(n3)).toBe(-1);
		expect(lru.indexOf(n1)).toBe(0); // n1 is the sole survivor

		lru.destroy();
	});

	it('put should reset TTL: element updated just before expiry should survive a full TTL period', () => {
		const lru = new Set<NumberComparable>(5, 1000);
		const n1 = new NumberComparable(1);
		const n2 = new NumberComparable(2);
		lru.add(n1);
		lru.add(n2);

		// Advance to just before expiry
		jest.advanceTimersByTime(900);

		// Update n1 via put — should create a fresh node and reset its TTL
		const n1Updated = new NumberComparable(1);
		lru.put(n1Updated, 0, undefined, (current) => current?.value === 1);

		// Advance another 600ms: n1's original TTL would have expired, but the updated node has a fresh TTL
		jest.advanceTimersByTime(600);

		expect(lru.indexOf(n1Updated)).toBe(0); // n1 survived with reset TTL
		expect(lru.indexOf(n2)).toBe(-1);       // n2 expired at 1500ms

		lru.destroy();
	});

	it('put should move the element to be the last to expire among current entries', () => {
		const lru = new Set<NumberComparable>(5, 1000);
		const n1 = new NumberComparable(1);
		const n2 = new NumberComparable(2);
		const n3 = new NumberComparable(3);
		lru.add(n1);
		lru.add(n2);
		lru.add(n3);

		// Advance 600ms, then update n1 — it should go to the back of the expiry queue
		jest.advanceTimersByTime(600);
		const n1Updated = new NumberComparable(1);
		lru.put(n1Updated, 0, undefined, (current) => current?.value === 1);

		// At 1100ms: n2 and n3 expire, n1Updated is still alive (reset at 600ms, expires at 1600ms)
		jest.advanceTimersByTime(500); // total: 1100ms

		expect(lru.indexOf(n2)).toBe(-1);
		expect(lru.indexOf(n3)).toBe(-1);
		expect(lru.indexOf(n1Updated)).toBe(0); // n1 is the sole survivor

		lru.destroy();
	});
});
