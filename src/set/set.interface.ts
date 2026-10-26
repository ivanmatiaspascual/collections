import { Comparable } from "./comparable.interface";

export interface Set<T extends Comparable> {
	readonly length: number;
	indexFor(comparable: T, start?: number, end?: number): number;
	indexOf(comparable: T, start?: number, end?: number): number;
	forEach(callback: (comparable: T, i: number, set: Set<T>) => void, thisArg?: any): Set<T>;
	forEachReverse(callback: (comparable: T, i: number, set: Set<T>) => void, thisArg?: any): Set<T>;
	reduce<U>(callback: (initialValue: U, comparable: T, index: number, set: Set<T>) => U, initialValue: U): U;
	get(index: number): T | undefined;
	map<U extends Comparable>(callback: (comparable: T, i: number, set: Set<T>) => U): Set<U>;
	slice(start: number, end: number): Set<T>;
	splice(start: number, deleteCount?: number): Set<T>;
	filter(callback: (value: T, index: number, set: Set<T>) => boolean): Set<T>;
	clear(): this;
	toArray(): T[];
	add(comparable: T, start?: number, end?: number): number;
	addAll(comparables: T[], start?: number, end?: number): number;
	put(comparable: T, start?: number, end?: number, condition?: ((comparable: T | undefined, index: number) => boolean) | undefined): number;
	merge(comparables: T[], start?: number, end?: number): void;
	remove(comparable: T): Set<T>;
	remove(comparable: (other: Comparable) => number): Set<T>;
	remove(start: number, deleteCount?: number | undefined): Set<T>;
	reverse(): this;
	first(): T;
	last(): T;
}