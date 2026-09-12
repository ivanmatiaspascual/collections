import { Comparable } from "../../set/comparable.interface";
import { Set as Interface } from "../../set/set.interface";
import { Set as Super } from "../set";
import { Node } from "./node";

export class Set<T extends Comparable> implements Interface<T> {

	private set: Super<Node<T>>; // LRU capacity eviction
	private ttl: number; // ms
	private expiryHead?: Node<T>; // oldest = evict first
	private expiryTail?: Node<T>;
	private timeoutId?: ReturnType<typeof setTimeout>;

	public constructor(capacity: number, ttl: number, ...args: T[]) {
		this.set = new Super<Node<T>>(capacity);
		this.ttl = ttl;
		for (const comparable of args) {
			this.add(comparable);
		}
	}

	private handleEvict = (evictedNode: any) => {
		// evictedNode is LRU.Node<TTL.Node<T>>.
		// Its .comparable property is the actual TTL.Node<T>.
		if (evictedNode && evictedNode.comparable) {
			this._removeFromExpiryList(evictedNode.comparable);
		}
	};

	private _removeFromExpiryList(node: Node<T>) {
		if (node.expiryPrevious) {
			node.expiryPrevious.expiryNext = node.expiryNext;
		} else {
			this.expiryHead = node.expiryNext;
		}
		if (node.expiryNext) {
			node.expiryNext.expiryPrevious = node.expiryPrevious;
		} else {
			this.expiryTail = node.expiryPrevious;
		}
		node.expiryPrevious = undefined;
		node.expiryNext = undefined;
		return this;
	}

	private _addToExpiryList(node: Node<T>) {
		if (!this.expiryHead) {
			this.expiryHead = node;
			this.expiryTail = node;
		} else {
			// Add to tail (newest)
			node.expiryPrevious = this.expiryTail;
			this.expiryTail!.expiryNext = node;
			this.expiryTail = node;
		}
		if (!this.timeoutId) {
			this.scheduleEviction();
		}
		return this;
	}

	private scheduleEviction() {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
			this.timeoutId = undefined;
		}
		if (this.expiryHead) {
			const delay = Math.max(0, this.expiryHead.expiresAt - Date.now());
			this.timeoutId = setTimeout(() => this.evictExpired(), delay);
		}
	}

	private evictExpired() {
		const now = Date.now();
		while (this.expiryHead && this.expiryHead.expiresAt <= now) {
			const expired = this.expiryHead;
			this._removeFromExpiryList(expired);
			this.set.remove(expired);
		}
		this.scheduleEviction();
	}

	public get length(): number {
		return this.set.length;
	}

	public indexFor(comparable: T, start?: number, end?: number): number {
		return this.set.indexFor(<Node<T>>{ compareTo: other => comparable.compareTo(other) }, start, end);
	}

	public indexOf(comparable: T, start?: number, end?: number): number {
		return this.set.indexOf(<Node<T>>{ compareTo: other => comparable.compareTo(other) }, start, end);
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
		const index = this.set.add(node, start, end, this.handleEvict);
		if (index > -1) {
			this._addToExpiryList(node);
		}
		return index;
	}

	public addAll(comparables: T[], start?: number, end?: number): number {
		throw new Error("Method not implemented.");
	}

	public put(comparable: T, start = 0, end?: number, condition?: ((comparable: T | undefined, index: number) => boolean) | undefined): number {
		const newNode = new Node<T>(comparable, this.ttl);
		const existingIndex = this.set.indexOf(<Node<T>>{ compareTo: other => comparable.compareTo(other) });
		const oldNode = existingIndex > -1 ? this.set.get(existingIndex) : undefined;

		const wrappedCondition = condition
			? (n: Node<T> | undefined, i: number) => condition(n?.comparable, i)
			: undefined;

		const index = this.set.put(newNode, start, end, wrappedCondition, this.handleEvict);
		if (index > -1) {
			if (oldNode) {
				this._removeFromExpiryList(oldNode);
			}
			this._addToExpiryList(newNode);
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
			removedLRU = this.set.remove(<Node<T>>{ compareTo: other => param.compareTo(other) });
		} else if (typeof param === "number") {
			removedLRU = this.set.remove(param, count);
		} else { // "function"
			removedLRU = this.set.remove(<Node<T>>{ compareTo: param });
		}

		const removed = new Set<T>(this.set.capacity, this.ttl);
		removedLRU.forEach((node) => {
			this._removeFromExpiryList(node);
			removed.set.add(node);
			removed._addToExpiryList(node);
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
		this.expiryHead = undefined;
		this.expiryTail = undefined;
	}

}