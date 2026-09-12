import { Comparable } from "../set/comparable.interface";

export class Node<T extends Comparable> implements Comparable {

	public comparable: T;
	public previous?: Node<T>;
	public next?: Node<T>;

	public constructor(comparable: T, previous?: Node<T>, next?: Node<T>) {
		this.comparable = comparable;
		this.previous = previous;
		this.next = next;
	}

	public compareTo(other: T) {
		return this.comparable.compareTo(other);
	}

}