/**
 * Merge object by another one. Use default value if new value is undefined or null
 * @param obj
 * @param newObj
 * @param defaults
 * @returns {any}
 */
export declare function mergeWithDefaults(obj: any, newObj?: {}, defaults?: {}): any;
/**
 * Return DOM element which is/into container and contains defined class
 *
 * @param {HTMLElement} element
 * @param {HTMLElement} containerElement
 * @param {string} className
 * @returns {HTMLElement}
 */
export declare function getElementContainer(element: HTMLElement, containerElement?: HTMLElement, className?: string): HTMLElement;
/**
 * Simulate focus/blur events of the inner input element to the outer element
 *
 * @param {HTMLElement} element
 * @param {HTMLElement} inputElement
 * @param {HTMLElement} isolatedClass for area which is independent on click event
 * @returns {function} unbind function for listeners.
 */
export declare function bindFocusBlur(element: HTMLElement, inputElement: HTMLElement, isolatedClass?: string): {
    element: HTMLElement;
    inputElement: HTMLElement;
    unbind: () => void;
};
/**
 * Sets the selected item in the dropdown menu
 * of available loadedListItems.
 *
 * @param {object} list
 * @param {object} item
 */
export declare function scrollActiveOption(list: any, item: any): void;
/**
 * Calculate free space for menu and return true if need to change menu direction
 * @param toggleElement
 * @param menuElement
 * @param defaultMenuHeightPx
 * @returns {boolean}
 */
export declare function hasNoSpaceBelowForMenu(toggleElement: any, menuElement: any, defaultMenuHeightPx?: number): boolean;
export declare function groupsIsEmpty(groups: any): boolean;
/**
 * Find array intersections
 * Equal of lodash _.intersection + getter + invert
 *
 * @param {any[]} xArr
 * @param {any[]} yArr
 * @param {Function} getter
 * @param {boolean} invert
 * @returns {any[]}
 */
export declare function intersection(xArr: any[], yArr: any[], getter?: Function, invert?: boolean): any[];
/**
 * Filter items by comparison label (=getLabel(item)) and query
 * asc sorting of result
 *
 * @param items
 * @param query
 * @param {Function} getLabel
 * @param {{fields?: any[]; sort?: ("asc" | "desc"); strict?: boolean}} options
 * @returns {any[]}
 */
export declare function ascSort(items: any, query: any, getLabel: Function, options?: {
    fields?: any[];
    sort?: 'asc' | 'desc';
    strict?: boolean;
}): any;
/**
 * Transform flat loadedListItems array to groupped object
 *
 * Example:
 * const loadedListItems = [{t: 'A', g: 'x'}, {t: 'B', g: 'x'}, {t: 'C'}]
 * const getter = (option) => option.g
 *
 * groupOptions(loadedListItems, getter)
 * // Result: {'x': [{t: 'A', g: 'x'}, {t: 'B', g: 'x'}], '': [{t: 'C'}]}
 *
 * @param {Array} options
 * @param {(option) => string} groupNameGetter
 * @returns {{: Array}}
 */
export declare function distributeOptionsByGroup(options?: any[], groupNameGetter?: (item: any) => string): {
    '': any[];
};
export declare function findIndex(items: any[], item: any, trackByGetter?: (item: any) => any): number;
export declare function removeChildren(element: any): void;
/**
 *
 * @param {HTMLElement} containerElement
 * @param {any[]} newItems
 * @param {(item) => Element} elementConstructor
 * @param {Function} trackFieldGetter
 * @param {boolean} appendUndefinedItems - place undefined items to the end of list (they prepend by default)
 * @returns {HTMLElement} containerElement with changes
 */
export declare function updateElements(containerElement: HTMLElement, newItems: any[], elementConstructor: (item: any) => Element, trackFieldGetter?: Function, appendUndefinedItems?: boolean): HTMLElement;
/**
 * Replace field value in deep object
 *
 * @param oldVal
 * @param newVal
 * @param {Object} object
 * @returns {{} & Object}
 */
export declare function deepReplace(oldVal: any, newVal: any, object: object): {};
/**
 * Find value in object by path
 *
 * Example:
 * deepFind({a: {b: 1}}, 'a.b') //1
 *
 * @param {Object} obj
 * @param {string} path
 * @param {boolean} originalIfNotFound
 * @returns {any}
 */
export declare function deepFind(obj: any, path: string, originalIfNotFound?: boolean): any;
/**
 * Highlight `substr` in `str` by `<mark>` or custom tag
 *
 * @param {string} str
 * @param {string} substr
 * @param {string} tagName. `mark` by default
 * @returns {string} highlighted string
 */
export declare function highlight(str?: string, substr?: string, tagName?: string): string;
/**
 * Debounce and extract target value from event
 * Useful for shadow-dom case when universal debounce works incorrect
 * @param fn
 * @param timeout
 * @returns {(e) => any}
 */
export declare function debounceEventValue(fn: any, timeout: any): (e: any) => void;
export declare function getItemsByField(fields: any, items: any[], fieldGetter: Function): any;
export declare const noopPipe: (item?: any) => any;
export declare const noop: (item?: any) => void;
/**
 * Cache value for '' query and last value
 */
export declare class QueryCache {
    private cache;
    get(query?: string): any;
    getLast(): any;
    set(query: string, value: any): void;
    clear(): void;
    private getValue;
}
