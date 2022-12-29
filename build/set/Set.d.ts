import Comparable from "./interfaces/Comparable";
/**
 * Wrapper de Array.
 * Envolvemos la funcionalidad de la clase Array de javascript para que permita almacenar elementos de forma ordenada.
 * No permite contener elementos duplicados.
 * Por defecto adhiere elementos de forma ascendente y se trata a los elementos como si fueran numericos.
 * @memberof helper.collection
 */
declare class Set<T extends Comparable> {
    private array;
    /**
     * @param {...helper.collection.Comparable} args Los mismos argumentos que soporta la clase built-in nativa Array
     */
    constructor(...args: any[]);
    /**
     * No inserta duplicados.
     * Si detecta que es un duplicado devuelve -1.
     * @private
     * @param {helper.collection.Comparable} comparable
     * @param {number} [start = 0]
     * @param {number} [end = this.array.length]
     * @return {number}
     */
    private indexFor;
    /**
     * Busqueda binaria.
     * Este es el indice de un elemento, si no lo encuentra devuelve -1.
     * Devuelve el indice del elemento si lo encuentra.
     * @param {helper.collection.Comparable} comparable
     * @param {number} [start = 0]
     * @param {number} [end = this.array.length]
     * @return {number}
     */
    private indexOf;
    forEach(callback: (comparable: T, i: number, set: Set<T>) => Set<T>): this;
    /**
     * Similar al find que tiene Array pero con busqueda binaria
     * @param compareTo
     * @returns
     */
    find(compareTo: (datum: T) => number): T;
    reduce(callback: (initialValue: any, comparable: T, i: number, set: Set<T>) => any, initialValue: any): any;
    get length(): number;
    get(index: number): T | undefined;
    map(callback: (comparable: T, i: number, set: Set<T>) => Set<T>): Set<T>;
    slice(begin: number, end: number): Set<T>;
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
     * @param {T} comparable
     * @return {number} indice donde se encontraba insertado o -1 si no pudo removerlo porque no se encontraba insertado
     */
    remove(comparable: T): number;
}
export default Set;
