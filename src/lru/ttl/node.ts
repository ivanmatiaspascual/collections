import { Comparable } from "../../set/comparable.interface";
import { Node as Super } from "../node";

export class Node<T extends Comparable> extends Super<T> {
	public expiresAt: number;
	public expiryPrevious?: Node<T>;
	public expiryNext?: Node<T>;

	public constructor(comparable: T, ttl: number) {
		super(comparable);
		this.expiresAt = Date.now() + ttl;
	}

	public compareTo(other: Comparable): number {
		const otherComparable = other instanceof Node ? other.comparable : other;
		return this.comparable.compareTo(otherComparable);
	}

}