"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Wrapper de Array.
 * Envolvemos la funcionalidad de la clase Array de javascript para que permita almacenar elementos de forma ordenada.
 * No permite contener elementos duplicados.
 * Por defecto adhiere elementos de forma ascendente y se trata a los elementos como si fueran numericos.
 * @memberof helper.collection
 */
var Set = /** @class */ (function () {
    /**
     * @param {...helper.collection.Comparable} args Los mismos argumentos que soporta la clase built-in nativa Array
     */
    function Set() {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.reverser = 1; // 1 o -1
        this.array = [];
        (_a = this.array).push.apply(_a, args);
    }
    Set.prototype.compare = function (comparable, otherComparable) {
        return comparable.compareTo(otherComparable) * this.reverser;
    };
    /**
     * No inserta duplicados.
     * Si detecta que es un duplicado devuelve -1.
     * @private
     * @param {helper.collection.Comparable} comparable
     * @param {number} [start = 0]
     * @param {number} [end = this.array.length]
     * @return {number}
     */
    Set.prototype.indexFor = function (comparable, start, end) {
        if (start === void 0) { start = 0; }
        if (end === void 0) { end = this.array.length; }
        var pivot = parseInt((start + (end - start) / 2).toString(), 10);
        if (end - start <= 0) {
            return pivot;
        }
        var comparator = this.compare(comparable, this.array[pivot]);
        if (comparator === 0) {
            return -1; // duplicado
        }
        else if (comparator < 0) {
            return this.indexFor(comparable, start, pivot);
        }
        else {
            return this.indexFor(comparable, pivot + 1, end);
        }
    };
    /**
     * Busqueda binaria.
     * Este es el indice de un elemento, si no lo encuentra devuelve -1.
     * Devuelve el indice del elemento si lo encuentra.
     * @param {helper.collection.Comparable} comparable
     * @param {number} [start = 0]
     * @param {number} [end = this.array.length]
     * @return {number}
     */
    Set.prototype.indexOf = function (comparable, start, end) {
        if (start === void 0) { start = 0; }
        if (end === void 0) { end = this.array.length; }
        var pivot = parseInt((start + (end - start) / 2).toString(), 10);
        if (end - start <= 0) {
            return -1; // No encontrado
        }
        var comparator = this.compare(comparable, this.array[pivot]);
        if (comparator === 0) {
            return pivot;
        }
        else if (comparator < 0) {
            return this.indexOf(comparable, start, pivot);
        }
        else {
            return this.indexOf(comparable, pivot + 1, end);
        }
    };
    Set.prototype.forEach = function (callback, thisArg) {
        var _this = this;
        this.array.forEach(function (comparable, i, array) {
            callback(comparable, i, _this);
        });
        return this;
    };
    Set.prototype.forEachReverse = function (callback, thisArg) {
        var _this = this;
        this.array.forEach(function (comparable, i, array) {
            var j = array.length - i - 1;
            callback(array[j], j, _this);
        });
        return this;
    };
    Set.prototype.reduce = function (callback, initialValue) {
        var _this = this;
        return this.array.reduce(function (comparable, i, array) {
            return callback(initialValue, comparable, i, _this);
        }, initialValue);
    };
    Object.defineProperty(Set.prototype, "length", {
        get: function () {
            return this.array.length;
        },
        enumerable: false,
        configurable: true
    });
    Set.prototype.get = function (index) {
        return this.array[index];
    };
    Set.prototype.map = function (callback) {
        var _this = this;
        var set = new Set();
        set.array = this.array.map(function (comparable, i, array) { return callback(comparable, i, _this); });
        return set;
    };
    Set.prototype.slice = function (start, end) {
        var set = new Set();
        set.array = this.array.slice(start, end);
        return set;
    };
    Set.prototype.splice = function (start, deleteCount) {
        var _a;
        if (deleteCount === void 0) { deleteCount = 0; }
        var items = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            items[_i - 2] = arguments[_i];
        }
        var set = new Set();
        set.array = (_a = this.array).splice.apply(_a, __spreadArray([start, deleteCount], items, false));
        return set;
    };
    Set.prototype.filter = function (callback) {
        var _this = this;
        var set = new Set();
        set.array = this.array.filter(function (comparable, i, array) { return callback(comparable, i, _this); });
        return set;
    };
    Set.prototype.clear = function () {
        this.array = [];
        return this;
    };
    /**
     * Devuelve una copia
     * @returns
     */
    Set.prototype.toArray = function () {
        return this.array.slice(0); // copy
    };
    /**
     * Devuelve el indice en el que se va a encontrar al elemento nuevo.
     * @return {number} indice donde fue insertado o -1 si el recibido por parametro es un duplicado el cual ignora
     */
    Set.prototype.add = function (comparable, start, end) {
        if (start === void 0) { start = 0; }
        if (end === void 0) { end = this.array.length; }
        var index = this.indexFor(comparable, start, end);
        if (index > -1) {
            this.array.splice(index, 0, comparable);
        }
        return index;
    };
    /**
     * En caso de existir lo reemplaza y en caso de no existir lo adhiere.
     * Devuelve el indice en el que se va a encontrar al elemento nuevo.
     * @param comparable
     * @param start
     * @param end
     * @param condition Si se cumple la condicion inserta/reemplaza el elemento
     * @return {number} indice donde fue insertado/reemplazado, -1 si no fue insertado
     */
    Set.prototype.put = function (comparable, start, end, condition) {
        if (start === void 0) { start = 0; }
        if (end === void 0) { end = this.array.length; }
        var pivot = parseInt((start + (end - start) / 2).toString(), 10);
        if (end - start <= 0) {
            this.array.splice(pivot, 0, comparable); // Add
            return pivot;
        }
        var comparator = this.compare(comparable, this.array[pivot]);
        if (comparator === 0) {
            if (!condition || condition(this.array[pivot], pivot)) {
                this.array.splice(pivot, 1, comparable); // Replace
                return pivot;
            }
            else {
                return -1;
            }
        }
        else if (comparator < 0) {
            return this.put(comparable, start, pivot, condition);
        }
        else {
            return this.put(comparable, pivot + 1, end, condition);
        }
    };
    /**
     * Esto no es un merge, intenta adherir o insertar los elementos
     * entre dos elementos de los existentes, en un unico indice, si hay solapamiento
     * o los mismos deben intercalarse entre los existentes no es posible adherir lo solicitado.
     * @param {helper.collection.Comparable[]} comparables Debe estar ordenado.
     * @param {number} [start = 0]
     * @param {number} [end = this.array.length]
     * @return {number} indice donde fueron insertados los elementos o -1 si el recibido por parametro es un duplicado el cual ignora
     */
    Set.prototype.addAll = function (comparables, start, end) {
        if (start === void 0) { start = 0; }
        if (end === void 0) { end = this.array.length; }
        if (comparables.length < 1) {
            return -1;
        }
        else if (comparables.length === 1) {
            return this.add(comparables[0]);
        }
        var index = -1;
        if (this.array.length === 0) {
            index = 0;
        }
        else {
            var existingFirst = this.array[0];
            var existingLast = this.array[this.array.length - 1];
            var requestedFirst = comparables[0];
            var requestedLast = comparables[comparables.length - 1];
            var requestedLastCompareToExistingFirst = this.compare(requestedLast, existingFirst);
            if (requestedLastCompareToExistingFirst < 0) { // si estan las dos por debajo de la mas vieja de las coordenadas
                index = 0; // al principio
            }
            else {
                var requestedFirstCompareToexistingLast = this.compare(requestedFirst, existingLast);
                if (requestedFirstCompareToexistingLast > 0) {
                    index = this.array.length; // al final
                }
                else {
                    var indexRequestedFirst = this.indexFor(requestedFirst);
                    if (indexRequestedFirst > -1) {
                        var indexRequestedLast = this.indexFor(requestedLast);
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
                }
                else {
                    // para no tener que realizar el apply sobre la variable comparables pasada por parametro asi no modificamos el parametro de entrada
                    var aux = this.array;
                    this.array = comparables.slice(0); // creamos una copia de forma performante
                    Array.prototype.push.apply(this.array, aux); // mas performante que concat
                }
            }
            else if (index === this.array.length) { // o al final
                if (comparables.length > 65536) { // Attempting to call a function with more than 65536 arguments results in a RangeError being thrown
                    this.array = this.array.concat(comparables);
                }
                else {
                    Array.prototype.push.apply(this.array, comparables); // mas performante que concat
                }
            }
            else { // o en el medio
                var begin = this.array.slice(0, index);
                if (comparables.length > 65536) { // Attempting to call a function with more than 65536 arguments results in a RangeError being thrown
                    begin = begin.concat(comparables);
                }
                else {
                    Array.prototype.push.apply(begin, comparables); // mas performante que concat
                }
                var end_1 = this.array.slice(index, this.array.length);
                if (end_1.length > 65536) {
                    this.array = begin.concat(end_1);
                }
                else {
                    Array.prototype.push.apply(begin, end_1); // mas performante que concat
                    this.array = begin;
                }
            }
        }
        return index;
    };
    /**
     * Adhiere los elementos que no estan duplicados, los duplicados los ignora.
     * @param {T[]} comparables
     */
    Set.prototype.merge = function (comparables, start, end) {
        if (start === void 0) { start = 0; }
        if (end === void 0) { end = this.array.length; }
        throw new TypeError("Not implemented.");
    };
    /**
     * @param {T | Comparable["compareTo"]} param Objeto o una funcion compareTo
     * @return {number} indice donde se encontraba insertado o -1 si no pudo removerlo porque no se encontraba insertado
     */
    Set.prototype.remove = function (param) {
        var index;
        if (typeof param === "object") {
            index = this.indexOf(param);
        }
        else { // "function"
            index = this.indexOf({ compareTo: param });
        }
        if (index > -1) {
            this.array.splice(index, 1);
        }
        return index;
    };
    Set.prototype.reverse = function () {
        this.array.reverse();
        this.reverser = this.reverser * (-1);
        return this;
    };
    return Set;
}());
exports.default = Set;
//# sourceMappingURL=Set.js.map