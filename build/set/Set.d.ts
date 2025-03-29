import Comparable from "./interfaces/Comparable";
/**
 * Wrapper de Array.
 * Envolvemos la funcionalidad de la clase Array de javascript para que permita almacenar elementos de forma ordenada.
 * No permite contener elementos duplicados.
 * Por defecto adhiere elementos de forma ascendente y se trata a los elementos como si fueran numericos.
 * @memberof helper.collection
 */
declare class Set<T extends Comparable> {
    private reverser;
    private array;
    /**
     * @param {...helper.collection.Comparable} args Los mismos argumentos que soporta la clase built-in nativa Array
     */
    constructor(...args: any[]);
    private compare;
    /**
     * No inserta duplicados.
     * Si detecta que es un duplicado devuelve -1.
     * @private
     * @param {helper.collection.Comparable} comparable
     * @param {number} [start = 0]
     * @param {number} [end = this.array.length]
     * @return {number}
     */
    indexFor(comparable: T, start?: number, end?: number): number;
    /**
     * Busqueda binaria.
     * Este es el indice de un elemento, si no lo encuentra devuelve -1.
     * Devuelve el indice del elemento si lo encuentra.
     * @param {helper.collection.Comparable} comparable
     * @param {number} [start = 0]
     * @param {number} [end = this.array.length]
     * @return {number}
     */
    indexOf(comparable: T, start?: number, end?: number): number;
    forEach(callback: (comparable: T, i: number, set: Set<T>) => void, thisArg?: any): Set<T>;
    forEachReverse(callback: (comparable: T, i: number, set: Set<T>) => void, thisArg?: any): Set<T>;
    reduce(callback: (initialValue: any, comparable: T, i: number, set: Set<T>) => any, initialValue: any): any;
    get length(): number;
    get(index: number): T | undefined;
    map<U extends Comparable>(callback: (comparable: T, i: number, set: Set<T>) => U): Set<U>;
    slice(start: number, end: number): Set<T>;
    splice(start: number, deleteCount?: number, ...items: T[]): Set<T>;
    filter(callback: (value: T, index: number, set: Set<T>) => boolean): Set<T>;
    clear(): this;
    /**
     * Devuelve una copia
     * @returns
     */
    toArray(): T[];
    /**
     * Devuelve el indice en el que se va a encontrar al elemento nuevo.
     * @return {number} indice donde fue insertado o -1 si el recibido por parametro es un duplicado el cual ignora
     */
    add(comparable: T, start?: number, end?: number): number;
    /**
     * En caso de existir lo reemplaza y en caso de no existir lo adhiere.
     * Devuelve el indice en el que se va a encontrar al elemento nuevo.
     * @param comparable
     * @param start
     * @param end
     * @param condition Si se cumple la condicion inserta/reemplaza el elemento
     * @return {number} indice donde fue insertado/reemplazado, -1 si no fue insertado
     */
    put(comparable: T, start?: number, end?: number, condition?: (comparable: T, index: number) => boolean): number;
    /**
     * Esto no es un merge, intenta adherir o insertar los elementos
     * entre dos elementos de los existentes, en un unico indice, si hay solapamiento
     * o los mismos deben intercalarse entre los existentes no es posible adherir lo solicitado.
     * @param {helper.collection.Comparable[]} comparables Debe estar ordenado.
     * @param {number} [start = 0]
     * @param {number} [end = this.array.length]
     * @return {number} indice donde fueron insertados los elementos o -1 si el recibido por parametro es un duplicado el cual ignora
     */
    addAll(comparables: T[], start?: number, end?: number): number;
    /**
     * Adhiere los elementos que no estan duplicados, los duplicados los ignora.
     * @param {T[]} comparables
     */
    merge(comparables: T[], start?: number, end?: number): void;
    /**
     * @param {T | Comparable["compareTo"]} param Objeto o una funcion compareTo
     * @return {number} indice donde se encontraba insertado o -1 si no pudo removerlo porque no se encontraba insertado
     */
    remove(param: T | Comparable["compareTo"]): number;
    reverse(): this;
}
export default Set;
