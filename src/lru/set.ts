import { Set as Interface } from "../set/set.interface";
import { Set as _Set } from "../set/set";
import { Comparable } from "../set/comparable.interface";
import { Node } from "./node";

/**
 * Implement Eviction Policies: Use Least Recently Used (LRU) algorithms to drop old data when capacity is reached.
 */
export class Set<T extends Comparable> implements Interface<T> {
	private set: _Set<Node<T>> = new _Set();
	public readonly capacity: number;
	private head?: Node<T>;
	private tail?: Node<T>;

	public constructor(capacity: number, ...args: T[]) {
		this.capacity = capacity;
		for (const comparable of args) {
			this.add(comparable);
		}
	}

	private _remove(node: Node<T>) {
		if (node.previous) {
			node.previous.next = node.next;
		} else {
			this.head = node.next; // it was head
		}
		if (node.next) {
			node.next.previous = node.previous;
		} else {
			this.tail = node.previous; // it was tail
		}
		node.previous = undefined;
		node.next = undefined;
		return this;
	}

	private _add(node: Node<T>) {
		if (!this.head) {
			this.head = node;
			this.tail = node;
		} else {
			node.next = this.head;
			this.head.previous = node;
			this.head = node;
		}
		return this;
	}

	private _forEach(callback: (node: Node<T>) => void) {
		let current = this.head;
		while (current) {
			const next = current.next;
			callback(current);
			current = next;
		}
		return this;
	}

	public get length() {
		return this.set.length;
	}

	public indexFor(comparable: T, start?: number, end?: number): number {
		return this.set.indexFor(<Node<T>>{ compareTo: other => comparable.compareTo(other) });
	}

	public indexOf(comparable: T, start?: number, end?: number): number {
		return this.set.indexOf(<Node<T>>{ compareTo: other => comparable.compareTo(other) });
	}

	public forEach(callback: (comparable: T, i: number, set: Set<T>) => void, thisArg?: any): Set<T> {
		this.set.forEach((node, i, set) => {
			callback(node.comparable, i, this);
		});
		return this;
	}

	public forEachReverse(callback: (comparable: T, i: number, set: Set<T>) => void, thisArg?: any): Set<T> {
		this.set.forEachReverse((node, i, set) => {
			callback(node.comparable, i, this);
		});
		return this;
	}

	public reduce<U>(callback: (initialValue: U, comparable: T, index: number, set: Set<T>) => U, initialValue: U) {
		return this.set.reduce((initialValue, node, index, set) => {
			return callback(initialValue, node.comparable, index, this);
		}, initialValue);
	}

	public get(index: number): T | undefined {
		const node = this.set.get(index);
		if (node) {
			this._remove(node);
			this._add(node);
			return node.comparable;
		}
	}

	public map<U extends Comparable>(callback: (comparable: T, i: number, set: Interface<T>) => U): Interface<U> {
		throw new Error("Method not implemented.");
	}

	public slice(start: number, end: number) {
		const copy = new Set<T>(this.capacity);
		copy.set = this.set.slice(start, end);
		this._forEach(current => {
			copy._add(current);
		});
		return copy;
	}

	public splice(start: number, deleteCount = this.length - start) {
		return this.remove(start, deleteCount);
	}

	public filter(callback: (value: T, index: number, set: Interface<T>) => boolean): Interface<T> {
		throw new Error("Method not implemented.");
	}

	public clear(): this {
		throw new Error("Method not implemented.");
	}

	public toArray(): T[] {
		throw new Error("Method not implemented.");
	}

	public add(comparable: T, start = 0, end?: number, onEvict?: (node: Node<T>) => void) {
		const node: Node<T> = new Node(comparable);
		const index = this.set.add(node, start, end);
		if (index > -1) {
			if (this.length >= this.capacity && this.tail) {
				// Evict least recently used (tail) before inserting
				const evicted = this.tail;
				this.set.remove(evicted);
				this._remove(evicted);
				if (onEvict) onEvict(evicted);
			}
			this._add(node);
		}
		return index;
	}

	public addAll(comparables: T[], start?: number, end?: number): number {
		throw new Error("Method not implemented.");
	}

	public put(comparable: T, start = 0, end?: number, condition?: (comparable: T | undefined, index: number) => boolean, onEvict?: (node: Node<T>) => void): number {
		const newNode = new Node<T>(comparable);
		// Capture old node before put() replaces it in the inner set
		const existingIndex = this.set.indexOf(<Node<T>>{ compareTo: other => comparable.compareTo(other) });
		const oldNode = existingIndex > -1 ? this.set.get(existingIndex) : undefined;
		const wrappedCondition = condition
			? (n: Node<T> | undefined, i: number) => condition(n?.comparable, i)
			: undefined;
		const index = this.set.put(newNode, start, end, wrappedCondition);
		if (index > -1) {
			if (oldNode) {
				// Replace: swap old node out of LL, promote new node to head
				this._remove(oldNode);
			} else if (this.length > this.capacity && this.tail) {
				// Insert: evict least recently used (tail)
				const evicted = this.tail;
				this.set.remove(evicted);
				this._remove(evicted);
				if (onEvict) onEvict(evicted);
			}
			this._add(newNode);
		}
		return index;
	}

	public merge(comparables: T[], start?: number, end?: number): void {
		throw new Error("Method not implemented.");
	}

	public remove(comparable: T): Set<T>;
	public remove(comparable: Comparable["compareTo"]): Set<T>;
	public remove(start: number, deleteCount?: number): Set<T>;
	public remove(param: T | Comparable["compareTo"] | number, count = NaN): Set<T> {
		let _set: _Set<Node<T>>;
		if (typeof param === "object") {
			_set = this.set.remove(<Node<T>>{ compareTo: other => param.compareTo(other) });
		} else if (typeof param === "number") {
			_set = this.set.remove(param, count);
		} else { // "function"
			_set = this.set.remove(<Node<T>>{ compareTo: param });
		}
		let removed: Set<T> = new Set(this.capacity);
		this._forEach(current => {
			if (_set.indexOf(current) > -1) {
				this._remove(current); // unlink from this list
				removed.set.add(current); // insert into result's sorted inner set
				removed._add(current); // append to result's LRU list in traversal order
			}
		});
		return removed;
	}

	public reverse(): this {
		throw new Error("Method not implemented.");
	}

	public first(): T {
		throw new Error("Method not implemented.");
	}

	public last(): T {
		throw new Error("Method not implemented.");
	}

}