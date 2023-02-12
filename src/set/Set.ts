import Comparable from "./interfaces/Comparable";

/**
 * Wrapper de Array.
 * Envolvemos la funcionalidad de la clase Array de javascript para que permita almacenar elementos de forma ordenada.
 * No permite contener elementos duplicados.
 * Por defecto adhiere elementos de forma ascendente y se trata a los elementos como si fueran numericos.
 * @memberof helper.collection
 */
class Set<T extends Comparable> {
	
	private array: any[];
	
	/**
	 * @param {...helper.collection.Comparable} args Los mismos argumentos que soporta la clase built-in nativa Array
	 */
	constructor(...args: any[]) {
		this.array = [];
		this.array.push(...args);
	}

	/**
	 * No inserta duplicados.
	 * Si detecta que es un duplicado devuelve -1.
	 * @private
	 * @param {helper.collection.Comparable} comparable
	 * @param {number} [start = 0]
	 * @param {number} [end = this.array.length]
	 * @return {number}
	 */
	private indexFor(comparable: T, start = 0, end = this.array.length): number {
		const pivot = parseInt((start + (end - start) / 2).toString(), 10);
		if (end - start <= 0) {
			return pivot;
		} else {
			const comparator = comparable.compareTo(this.array[pivot]);
			if (comparator === 0) {
				return -1; // duplicado
			} else if (comparator < 0) {
				return this.indexFor(comparable, start, pivot);
			} else {
				return this.indexFor(comparable, pivot + 1, end);
			}
		}
	}

	/**
	 * Busqueda binaria.
	 * Este es el indice de un elemento, si no lo encuentra devuelve -1.
	 * Devuelve el indice del elemento si lo encuentra.
	 * @param {helper.collection.Comparable} comparable
	 * @param {number} [start = 0]
	 * @param {number} [end = this.array.length]
	 * @return {number}
	 */
	public indexOf(comparable: T, start = 0, end = this.array.length): number {
		const pivot = parseInt((start + (end - start) / 2).toString(), 10);
		if (end - start <= 0) {
			return -1; // No encontrado
		} else {
			const comparator = comparable.compareTo(this.array[pivot]);
			if (comparator === 0) {
				return pivot;
			} else if (comparator < 0) {
				return this.indexOf(comparable, start, pivot);
			} else {
				return this.indexOf(comparable, pivot + 1, end);
			}
		}
	}

	public forEach(callback: (comparable: T, i: number, set: Set<T>) => void, thisArg?: any): Set<T> {
		this.array.forEach((comparable, i, array) => {
			callback(comparable, i, this);
		});
		return this;
	}

	public forEachReverse(callback: (comparable: T, i: number, set: Set<T>) => void, thisArg?: any): Set<T> {
		this.array.forEach((comparable, i, array) => {
			const j = array.length - i - 1;
			callback(array[j], j, this);
		});
		return this;
	}

	public reduce(callback: (initialValue: any, comparable: T, i: number, set: Set<T>) => any, initialValue: any) {
		return this.array.reduce((comparable, i, array) => {
			return callback(initialValue, comparable, i, this);
		}, initialValue);
	}

	public get length() {
		return this.array.length;
	}

	public get(index: number): T | undefined {
		return this.array[index];
	}

	public map(callback: (comparable: T, i: number, set: Set<T>) => T, thisArg?: any): Set<T> {
		const set = new Set<T>();
		set.array = this.array.map((comparable, i, array) => {
			return callback(comparable, i, this);
		});
		return set;
	}

	public slice(begin: number, end: number) {
		const set = new Set<T>();
		set.array = this.array.slice(begin, end);
		return set;
	}

	public clear() {
		this.array = [];
		return this;
	}

	/**
	 * Devuelve una copia
	 * @returns 
	 */
	public toArray(): T[] {
		return this.array.slice(0); // copy
	}

	/**
	 * Devuelve el indice en el que se va a encontrar al elemento nuevo.
	 * @return {number} indice donde fue insertado o -1 si el recibido por parametro es un duplicado el cual ignora
	 */
	public add(comparable: T, start = 0, end = this.array.length) {
		const index = this.indexFor(comparable, start, end);
		if (index > -1) {
			this.array.splice(index, 0, comparable);
		}
		return index;
	}

	/**
	 * En caso de existir lo reemplaza y en caso de no existir lo adhiere.
	 * Devuelve el indice en el que se va a encontrar al elemento nuevo.
	 * @return {number} indice donde fue insertado o reemplazado
	 */
	public put(comparable: T, start = 0, end = this.array.length): number {
		const pivot = parseInt((start + (end - start) / 2).toString(), 10);
		if (end - start <= 0) {
			this.array.splice(pivot, 0, comparable); // Add
			return pivot;
		} else {
			const comparator = comparable.compareTo(this.array[pivot]);
			if (comparator === 0) {
				this.array.splice(pivot, 1, comparable); // Replace
				return pivot;
			} else if (comparator < 0) {
				return this.put(comparable, start, pivot);
			} else {
				return this.put(comparable, pivot + 1, end);
			}
		}
	}

	/**
	 * Esto no es un merge, intenta adherir o insertar los elementos
	 * entre dos elementos de los existentes, en un unico indice, si hay solapamiento
	 * o los mismos deben intercalarse entre los existentes no es posible adherir lo solicitado.
	 * @param {helper.collection.Comparable[]} comparables Debe estar ordenado.
	 * @param {number} [start = 0]
	 * @param {number} [end = this.array.length]
	 * @return {number} indice donde fueron insertados los elementos o -1 si el recibido por parametro es un duplicado el cual ignora
	 */
	public addAll(comparables: T[], start = 0, end = this.array.length) {
		if (comparables.length < 1) {
			return -1;
		} else if (comparables.length === 1) {
			return this.add(comparables[0]);
		}

		let index = -1;

		if (this.array.length === 0) {
			index = 0;
		} else {
			const existingFirst = this.array[0];
			const existingLast = this.array[this.array.length - 1];
			const requestedFirst = comparables[0];
			const requestedLast = comparables[comparables.length - 1];

			const requestedLastCompareToExistingFirst = requestedLast.compareTo(existingFirst);
			if (requestedLastCompareToExistingFirst < 0) { // si estan las dos por debajo de la mas vieja de las coordenadas
				index = 0; // al principio
			} else {
				const requestedFirstCompareToexistingLast = requestedFirst.compareTo(existingLast);
				if (requestedFirstCompareToexistingLast > 0) {
					index = this.array.length; // al final
				} else {
					const indexRequestedFirst = this.indexFor(requestedFirst);
					if (indexRequestedFirst > -1) {
						const indexRequestedLast = this.indexFor(requestedLast);
						if (indexRequestedLast > -1 && indexRequestedFirst === indexRequestedLast) {
							index = indexRequestedFirst; // o indexRequestedLast
						}
					}
				}
			}
		}

		if (index > -1) { // si tengo que insertar
			if (index === 0) { // al principio
				if (this.array.length > 65536) { // Attempting to call a function with more than 65536 arguments results in a RangeError being thrown
					this.array = comparables.concat(this.array);
				} else {
					// para no tener que realizar el apply sobre la variable comparables pasada por parametro asi no modificamos el parametro de entrada
					const aux = this.array;
					this.array = comparables.slice(0); // creamos una copia de forma performante
					Array.prototype.push.apply(this.array, aux); // mas performante que concat
				}
			} else if (index === this.array.length) { // o al final
				if (comparables.length > 65536) { // Attempting to call a function with more than 65536 arguments results in a RangeError being thrown
					this.array = this.array.concat(comparables);
				} else {
					Array.prototype.push.apply(this.array, comparables); // mas performante que concat
				}
			} else { // o en el medio
				let begin = this.array.slice(0, index);
				if (comparables.length > 65536) { // Attempting to call a function with more than 65536 arguments results in a RangeError being thrown
					begin = begin.concat(comparables);
				} else {
					Array.prototype.push.apply(begin, comparables); // mas performante que concat
				}
				const end = this.array.slice(index, this.array.length);
				if (end.length > 65536) {
					this.array = begin.concat(end);
				} else {
					Array.prototype.push.apply(begin, end); // mas performante que concat
					this.array = begin;
				}
			}
		}

		return index;
	}

	/**
	 * Adhiere los elementos que no estan duplicados, los duplicados los ignora.
	 * @param {T[]} comparables
	 */
	public merge(comparables: T[], start = 0, end = this.array.length) {
		throw new TypeError("Not implemented.");
	}

	/**
	 * @param {T | Comparable["compareTo"]} param Objeto o una funcion compareTo
	 * @return {number} indice donde se encontraba insertado o -1 si no pudo removerlo porque no se encontraba insertado
	 */
	public remove(param: T | Comparable["compareTo"]) {
		let index;
		if (typeof param === "object") {
			index = this.indexOf(param);
		} else { // "function"
			index = this.indexOf(<T>{ compareTo: param });
		}
		if (index > -1) {
			this.array.splice(index, 1);
		}
		return index;
	}
}

export default Set;