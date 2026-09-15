import { Comparable } from "../../set/comparable.interface";
import { Set as Interface } from "../../set/set.interface";
import { Set as _Set } from "../set";
import { Node } from "./node";

export class Set<T extends Comparable> implements Interface<T> {

	private set: _Set<Node<T>>; // LRU capacity eviction
	private ttl: number; // ms
	private head?: Node<T>; // oldest = evict first
	private tail?: Node<T>;
	private timeoutId?: ReturnType<typeof setTimeout>;

	public constructor(capacity: number, ttl: number, ...args: T[]) {
		this.set = new _Set<Node<T>>(capacity);
		this.ttl = ttl;
		for (const comparable of args) {
			this.add(comparable);
		}
	}

	private _remove(node: Node<T>) {
		if (node.previous) {
			node.previous.next = node.next;
		} else {
			this.head = node.next;
		}
		if (node.next) {
			node.next.previous = node.previous;
		} else {
			this.tail = node.previous;
		}
		node.previous = undefined;
		node.next = undefined;
		return this;
	}

	private expired() {
		const now = Date.now();
		while (this.head && this.head.expires <= now) {
			const expired = this.head;
			this._remove(expired);
			this.set.remove(expired);
		}
		this.schedule();
	}

	private schedule() {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
			this.timeoutId = undefined;
		}
		if (this.head) {
			const delay = Math.max(0, this.head.expires - Date.now());
			this.timeoutId = setTimeout(() => this.expired(), delay);
		}
	}

	private _add(node: Node<T>) {
		if (!this.head) {
			this.head = node;
			this.tail = node;
		} else {
			// Add to tail (newest)
			node.previous = this.tail;
			this.tail!.next = node;
			this.tail = node;
		}
		if (!this.timeoutId) {
			this.schedule();
		}
		return this;
	}

	public get length(): number {
		return this.set.length;
	}

	public indexFor(comparable: T, start?: number, end?: number): number {
		return this.set.indexFor(<Node<T>>{ compareTo: other => comparable.compareTo(other.comparable) }, start, end);
	}

	public indexOf(comparable: T, start?: number, end?: number): number {
		return this.set.indexOf(<Node<T>>{ compareTo: other => comparable.compareTo(other.comparable) }, start, end);
	}

	public forEach(callback: (comparable: T, i: number, set: Interface<T>) => void, thisArg?: any): Interface<T> {
		this.set.forEach((node, i, set) => {
			callback(node.comparable, i, this);
		});
		return this;
	}

	public forEachReverse(callback: (comparable: T, i: number, set: Interface<T>) => void, thisArg?: any): Interface<T> {
		this.set.forEachReverse((node, i, set) => {
			callback(node.comparable, i, this);
		});
		return this;
	}

	public reduce<U>(callback: (initialValue: U, comparable: T, index: number, set: Interface<T>) => U, initialValue: U): U {
		return this.set.reduce((initialValue, node, index, set) => {
			return callback(initialValue, node.comparable, index, this);
		}, initialValue);
	}

	public get(index: number): T | undefined {
		const node = this.set.get(index);
		return node ? node.comparable : undefined;
	}

	public map<U extends Comparable>(callback: (comparable: T, i: number, set: Interface<T>) => U): Interface<U> {
		throw new Error("Method not implemented.");
	}

	public slice(start: number, end: number): Interface<T> {
		throw new Error("Method not implemented.");
	}

	public splice(start: number, deleteCount?: number): Interface<T> {
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

	public add(comparable: T, start = 0, end?: number): number {
		const node = new Node<T>(comparable, this.ttl);
		const index = this.set.add(node, start, end, this._remove);
		if (index > -1) {
			this._add(node);
		}
		return index;
	}

	public addAll(comparables: T[], start?: number, end?: number): number {
		throw new Error("Method not implemented.");
	}

	public put(comparable: T, start = 0, end?: number, condition?: ((comparable: T | undefined, index: number) => boolean) | undefined): number {
		const node = new Node<T>(comparable, this.ttl);
		let previous: Node<T> | undefined;
		const index = this.set.put(node, start, end, (current, index) => {
			previous = current;
			return !condition || condition(current?.comparable, index);
		}, this._remove);
		if (index > -1) {
			if (previous) {
				this._remove(previous);
			}
			this._add(node);
		}
		return index;
	}

	public merge(comparables: T[], start?: number, end?: number): void {
		throw new Error("Method not implemented.");
	}

	public remove(comparable: T): Interface<T>;
	public remove(comparable: Comparable["compareTo"]): Interface<T>;
	public remove(start: number, deleteCount?: number): Interface<T>;
	public remove(param: T | Comparable["compareTo"] | number, count = NaN): Interface<T> {
		let removedLRU: Interface<Node<T>>;
		if (typeof param === "object") {
			removedLRU = this.set.remove(<Node<T>>{ compareTo: other => param.compareTo(other.comparable) });
		} else if (typeof param === "number") {
			removedLRU = this.set.remove(param, count);
		} else { // "function"
			removedLRU = this.set.remove(<Node<T>>{ compareTo: other => param(other.comparable) });
		}

		const removed = new Set<T>(this.set.capacity, this.ttl);
		removedLRU.forEach((node) => {
			this._remove(node);
			removed.set.add(node);
			removed._add(node);
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

	public destroy() {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
			this.timeoutId = undefined;
		}
		this.head = undefined;
		this.tail = undefined;
	}

}