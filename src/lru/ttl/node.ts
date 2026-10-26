import { Comparable } from "../../set/comparable.interface";
import { Node as Super } from "../node";

export class Node<T extends Comparable> extends Super<T> {
	public expires: number;
	public previous?: Node<T>;
	public next?: Node<T>;

	public constructor(comparable: T, ttl: number) {
		super(comparable);
		this.expires = Date.now() + ttl;
	}

	public compareTo(other: Node<T>): number {
		return this.comparable.compareTo(other.comparable);
	}

}