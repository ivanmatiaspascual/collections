import { Set as _Set } from "./set";
import { Comparable } from "../../set/comparable.interface";

export namespace TimeToLive {
	// Implementacion
	export const Set = _Set;
	export type Set<T extends Comparable> = _Set<T>;
}