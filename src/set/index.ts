import { Set as _Set } from "./set";
import { Comparable } from "./comparable.interface";

export namespace Simple {
	export const Set = _Set; // Permite: const mySet = new simple.Set() (para inicializacion)
	export type Set<T extends Comparable> = _Set<T>; // Permite: let mySet: simple.Set<MyItem> (para declaracion)

}