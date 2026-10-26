import { Set as _Set } from "./set";
import { Comparable } from "../set/comparable.interface";
import { TimeToLive as _TimeToLive } from "./ttl";

export namespace LeastRecentlyUsed {
	// Implementacion
	export const Set = _Set;
	export type Set<T extends Comparable> = _Set<T>;
	// Sub-implementacion
	export import TimeToLive = _TimeToLive;
}