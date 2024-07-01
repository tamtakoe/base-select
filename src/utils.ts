import { myer } from './myer-array-diff';

/**
 * Merge object by another one. Use default value if new value is undefined or null
 * @param obj
 * @param newObj
 * @param defaults
 * @returns {any}
 */
export function mergeWithDefaults(obj: any, newObj: any = {}, defaults: any = {}) {
    for (let k in newObj) {
        const newValue = newObj[k];

        if (newObj.hasOwnProperty(k)) {
            obj[k] = newValue != null ? newValue :  defaults[k]; //(obj[k] != null ? obj[k] : defaults[k]);
        }
    }
    return obj;
}

/**
 * Return DOM element which is/into container and contains defined class
 *
 * @param {HTMLElement} element
 * @param {HTMLElement} containerElement
 * @param {string} className
 * @returns {HTMLElement}
 */
export function getElementContainer(element: HTMLElement, containerElement: HTMLElement = document.body, className?:string) {
    while (element && element.classList && element.ownerDocument && element.nodeType !== 11 ) { // 11 - DOCUMENT_FRAGMENT_NODE
        if ((className && element.className.indexOf(className) >= 0) || (!className && element === containerElement)) { // current.classList.contains(className) doesn't work in IE9
            return element;
        }

        element = element.parentElement;
    }
}

/**
 * Simulate focus/blur events of the inner input element to the outer element
 *
 * @param {HTMLElement} element
 * @param {HTMLElement} inputElement
 * @param {HTMLElement} isolatedClass for area which is independent on click event
 * @returns {function} unbind function for listeners.
 */
export function bindFocusBlur(element: HTMLElement, inputElement: HTMLElement, isolatedClass = 'isolated') {
    let isFocused = false, isMousedown = false, isBlur = false, shadowHost: any, parentNode: any = element.parentNode;

    document.addEventListener('click', clickHandler, true);
    element.addEventListener('mousedown', mousedownHandler, true);
    element.addEventListener('blur', blurHandler, true);
    inputElement.addEventListener('focus', focusHandler, true);

    // Check if element is in shadow DOM
    while (parentNode) {
        if (parentNode.host) {
            shadowHost = parentNode.host;
            break;
        }
        parentNode = parentNode.parentNode;
    }

    function blurHandler(event?: Event) {
        // console.log('+++ blurHandler', isMousedown);
        // if (event && event.target.nodeName !== 'INPUT') return; //for IE
        if (event && event.target !== inputElement) return; //for IE

        isBlur = false;
        isFocused = false;

        if (isMousedown) {
            isBlur = true;
            return;
        }

        setTimeout(function () {
            element.dispatchEvent(new Event('blur'));
            // element.dispatchEvent(new Event('blur', {bubbles: true, composed: true}));
        });
    }

    function focusHandler() {
        // console.log('+++ focusHandler', isFocused);
        if (!isFocused) {
            isFocused = true;

            setTimeout(function () {
                element.dispatchEvent(new Event('focus'));
            });
        }
    }

    function mousedownHandler() {
        // console.log('+++ mousedownHandler');
        isMousedown = true;
    }

    function clickHandler(event: Event) {
        console.log('+++ clickHandler', !!getElementContainer(event.target as HTMLElement, element), event.target, event.target !== inputElement, (event.target as any).nodeName);
        isMousedown = false;

        const activeElement = shadowHost && event.target === shadowHost ? element : event.target as HTMLElement;

        const isIsolatedElement = !!getElementContainer(activeElement, element, isolatedClass); //TODO Make custom isolated class

        if (isIsolatedElement) {
            return
        }

        const isSelectElement = !!getElementContainer(activeElement, element);

        if (isBlur && !isSelectElement) {
            blurHandler();
        }

        // if (isSelectElement && activeElement.nodeName !== 'INPUT') {
        if (isSelectElement && activeElement !== inputElement) {
            setTimeout(function () {
                inputElement.focus();
            });
        }

        if (!isSelectElement && isFocused) {
            isFocused = false;
        }
    }

    return {
        element: element,
        inputElement: inputElement,
        unbind: () => {
            document.removeEventListener('click', clickHandler, true);
            element.removeEventListener('mousedown', mousedownHandler, true);
            element.removeEventListener('blur', blurHandler, true);
            inputElement.removeEventListener('focus', focusHandler);
        }
    }

    // return {
    //     unbindAll: () => {
    //         document.removeEventListener('click', clickHandler, true);
    //         element.removeEventListener('mousedown', mousedownHandler, true);
    //         element.removeEventListener('blur', blurHandler, true);
    //         inputElement.removeEventListener('focus', focusHandler);
    //     },
    //     bindInput: (newInputElement) => {
    //         inputElement.removeEventListener('focus', focusHandler);
    //         inputElement = newInputElement;
    //         inputElement.addEventListener('focus', focusHandler, true);
    //     }
    // }

    // return function () {
    //     document.removeEventListener('click', clickHandler, true);
    //     element.removeEventListener('mousedown', mousedownHandler, true);
    //     element.removeEventListener('blur', blurHandler, true);
    //     inputElement.removeEventListener('focus', focusHandler, true);
    // }
}

/**
 * Sets the selected item in the dropdown menu
 * of available loadedListItems.
 *
 * @param {object} list
 * @param {object} item
 */
export function scrollActiveOption(list: any, item: any) {
    let y, height_menu, height_item, scroll, scroll_top, scroll_bottom;

    if (item) {
        height_menu = list.offsetHeight;
        height_item = getWidthOrHeight(item, 'height', 'margin'); //outerHeight(true);
        scroll = list.scrollTop || 0;
        y = getOffset(item).top - getOffset(list).top + scroll;
        scroll_top = y;
        scroll_bottom = y - height_menu + height_item;

        //TODO Make animation
        if (y + height_item > height_menu + scroll) {
            list.scrollTop = scroll_bottom;
        } else if (y < scroll) {
            list.scrollTop = scroll_top;
        }
    }
}

// Used for matching numbers
const core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;
const rnumnonpx = new RegExp("^(" + core_pnum + ")(?!px)[a-z%]+$", "i");

function augmentWidthOrHeight(elem: HTMLElement, name: string, extra: string, isBorderBox: boolean, styles: string[]) {
    let i = extra === (isBorderBox ? 'border' : 'content') ?
        // If we already have the right measurement, avoid augmentation
        4 :
        // Otherwise initialize for horizontal or vertical properties
        name === 'width' ? 1 : 0,

        val = 0,
        cssExpand = ['Top', 'Right', 'Bottom', 'Left'];

    //TODO Use angular.element.css instead of getStyleValue after https://github.com/caitp/angular.js/commit/92bbb5e225253ebddd38ef5735d66ffef76b6a14 will be applied
    function getStyleValue(name: any) {
        return parseFloat(styles[name]);
    }

    for (; i < 4; i += 2) {
        // both box models exclude margin, so add it if we want it
        if (extra === 'margin') {
            val += getStyleValue(extra + cssExpand[i]);
        }

        if (isBorderBox) {
            // border-box includes padding, so remove it if we want content
            if (extra === 'content') {
                val -= getStyleValue('padding' + cssExpand[i]);
            }

            // at this point, extra isn't border nor margin, so remove border
            if (extra !== 'margin') {
                val -= getStyleValue('border' + cssExpand[i] + 'Width');
            }
        } else {
            val += getStyleValue('padding' + cssExpand[i]);

            // at this point, extra isn't content nor padding, so add border
            if (extra !== 'padding') {
                val += getStyleValue('border' + cssExpand[i] + 'Width');
            }
        }
    }

    return val;
}

function getOffset(elem: HTMLElement) {
    let docElem, win,
        box = elem.getBoundingClientRect(),
        doc = elem && elem.ownerDocument;

    if (!doc) {
        return;
    }

    docElem = doc.documentElement;
    win = getWindow(doc);

    return {
        top: box.top + win.pageYOffset - docElem.clientTop,
        left: box.left + win.pageXOffset - docElem.clientLeft
    };
}

function getWindow(elem: Document) {
    return elem != null && elem === (elem as any).window ? elem : elem.nodeType === 9 && (elem as any).defaultView;
}

function getWidthOrHeight(elem: HTMLElement, name: any, extra: string) {
    // Start with offset property, which is equivalent to the border-box selectedItems
    let valueIsBorderBox = true,
        val: any = name === 'width' ? elem.offsetWidth : elem.offsetHeight,
        styles: any = window.getComputedStyle(elem, null),

        //TODO Make isBorderBox after https://github.com/caitp/angular.js/commit/92bbb5e225253ebddd38ef5735d66ffef76b6a14 will be applied
        isBorderBox = false; //jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

    // some non-html elements return undefined for offsetWidth, so check for null/undefined
    // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
    // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
    if (val <= 0 || val == null) {
        // Fall back to computed then uncomputed css if necessary
        val = styles[name];

        if (val < 0 || val == null) {
            val = elem.style[name];
        }

        // Computed unit is not pixels. Stop here and return.
        if (rnumnonpx.test(val)) {
            return val;
        }

        // we need the check for style in case a browser which returns unreliable values
        // for getComputedStyle silently falls back to the reliable elem.style
        //valueIsBorderBox = isBorderBox && ( jQuery.support.boxSizingReliable || val === elem.style[ name ] );

        // Normalize "", auto, and prepare for extra
        val = parseFloat(val) || 0;
    }

    // use the active box-sizing model to add/subtract irrelevant styles
    return val + augmentWidthOrHeight(elem, name, extra || ( isBorderBox ? "border" : "content" ), valueIsBorderBox, styles);
}

/**
 * Calculate free space for menu and return true if need to change menu direction
 * @param toggleElement
 * @param menuElement
 * @param defaultMenuHeightPx
 * @returns {boolean}
 */
export function hasNoSpaceBelowForMenu(toggleElement: HTMLElement, menuElement: HTMLElement, defaultMenuHeightPx = 100) {
    const spaceAbove = toggleElement.getBoundingClientRect().top;
    const spaceBelow = window.innerHeight - toggleElement.getBoundingClientRect().bottom;
    const maxMenuHeight = parseInt((window.getComputedStyle(menuElement) as any)['max-height']) || defaultMenuHeightPx;

    return spaceBelow < maxMenuHeight && spaceBelow < spaceAbove;
}

export function groupsIsEmpty(groups: any) {
    for (let k in groups) {
        if (groups.hasOwnProperty(k) && groups[k].length) {
            return false;
        }
    }
    return true;
}

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
export function intersection(xArr: any[], yArr: any[], getter?: Function, invert?: boolean): any[] {
    let i, j, n, filteredX, filteredY, out: any[] = invert ? xArr.slice() : [];

    for (i = 0, n = xArr.length; i < xArr.length; i++) {
        filteredX = getter ? getter(xArr[i]) : xArr[i];

        for (j = 0; j < yArr.length; j++) {
            filteredY = getter ? getter(yArr[j]) : yArr[j];

            if (deepEqual(filteredX, filteredY)) {
                invert ? out.splice(i + out.length - n, 1) : out.push(yArr[j]);
                break;
            }
        }
    }
    return out;
}

/**
 * Deep comparing of two values
 *
 * @param actual
 * @param expected
 * @param {boolean} strict
 * @returns {any}
 */
function deepEqual(actual: any, expected: any, strict = true) {
    if (actual === expected) {
        return true;

    } else if (actual instanceof Date && expected instanceof Date) {
        return actual.getTime() === expected.getTime();

    } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
        return strict ? actual === expected : actual == expected;

    } else {
        return objEqual(actual, expected, strict);
    }
}

/**
 * Deep comparison of two objects
 *
 * @param a
 * @param b
 * @param strict
 * @returns {boolean}
 */
function objEqual(a: any, b: any, strict: boolean) {
    let i, key;

    if (a == null || b == null) {
        return false;
    }

    if (a.prototype !== b.prototype) return false;

    try {
        let ka = Object.keys(a),
            kb = Object.keys(b);

        if (ka.length !== kb.length)
            return false;

        ka.sort();
        kb.sort();

        //cheap key test
        for (i = ka.length - 1; i >= 0; i--) {
            if (ka[i] != kb[i])
                return false;
        }

        //possibly expensive deep test
        for (i = ka.length - 1; i >= 0; i--) {
            key = ka[i];
            if (!deepEqual(a[key], b[key], strict)) return false;
        }

        return typeof a === typeof b;

    } catch (e) {//happens when one is a string literal and the other isn't
        return false;
    }
}

function toString(value: any) {
    return String(value !== void 0 ? value : '');
}

// todo: remove excess chars
const rEscapableCharacters = /[-\/\\^$*+?.()|[\]{}]/g;  // cache escape + match String
const sEscapeMatch = '\\$&';

/**
 * Escape special chars
 * @param string
 * @returns {string}
 */
function escapeCharacters(string: string) {
    return string.replace(rEscapableCharacters, sEscapeMatch);
}

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
export function ascSort(items: any, query: any, getLabel: Function, options: {fields?: any[], sort?: 'asc'|'desc', strict?: boolean} = {}) {
    let i, j, isFound, item, output, output1 = [], output2 = [], output3 = [],
        sort = options.sort,
        strict = options.strict,
        orderFactor = sort === 'desc' ? -1 : 1,
        regExpParams = strict ? '' : 'i';

    let getLabelArr: any[] = [getLabel];

    if (options.fields) {
        getLabelArr = options.fields.map(field => typeof field === 'function' ? field : (item: any) => deepFind(item, field, true))
    }

    getLabel = getLabelArr[0];

    if (query !== '' && getLabel) {
        const safeQuery = escapeCharacters(toString(query));
        const matchRegExp = new RegExp(safeQuery, regExpParams);
        const firstMatchRegExp = new RegExp('^' + safeQuery, regExpParams);

        // Filtering
        for (i = 0, isFound = false; i < items.length; i++) {
            item = items[i];

            for (j = 0; j < getLabelArr.length; j++) {
                const label = getLabelArr[j](item);

                isFound = label === query || !strict && label == query || query !== undefined && matchRegExp.test(toString(label));

                if (isFound) break;
            }

            if (isFound) {
                output1.push(item);
            }
        }

        if (sort) {
            output = output1;

        } else {
            // Place items starting with query on the top of list
            for (i = 0; i < output1.length; i++) {
                item = output1[i];

                if (firstMatchRegExp.test(toString(getLabel(item)))) {
                    output2.push(item);
                } else {
                    output3.push(item);
                }
            }
            output = output2.concat(output3);
        }

    } else {
        output = [].concat(items);
    }

    if (sort) {
        output = output.sort((A, B) => toString(getLabel(A)).localeCompare(toString(getLabel(B))) * orderFactor);
    }

    return output;
}

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
export function distributeOptionsByGroup(options: any[] = [], groupNameGetter = (item: any) => '') {
    let optionGroups: any = {'':[]},
        optionGroupName,
        optionGroup;

    for (let i = 0; i < options.length; i++) {
        optionGroupName = groupNameGetter(options[i]) || '';

        if (!(optionGroup = optionGroups[optionGroupName])) {
            optionGroup = optionGroups[optionGroupName] = [];
        }
        optionGroup.push(options[i]);
    }

    return optionGroups;
}

export function findIndex(items: any[] = [], item: any, trackByGetter = (item: any) => item) {
    for (let i = 0; i < items.length; i++) {
        if (trackByGetter(items[i]) === trackByGetter(item)) {
            return i;
        }
    }
}

export function removeChildren(element: HTMLElement) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/**
 *
 * @param {HTMLElement} containerElement
 * @param {any[]} newItems
 * @param {(item) => HTMLElement} elementConstructor
 * @param {Function} trackFieldGetter
 * @param {boolean} appendUndefinedItems - place undefined items to the end of list (they prepend by default)
 * @returns {HTMLElement} containerElement with changes
 */
export function updateElements(containerElement: HTMLElement, newItems: any[], elementConstructor: (item: any) => Element, trackFieldGetter?: Function, appendUndefinedItems?: boolean) {
    const elementsArr = Array.from(containerElement.children);
    const track = (item: any) => {
        const id = item !== undefined && (trackFieldGetter ? trackFieldGetter(item) : item);

        if (id || id === 0) return id;
    };
    const uncountableElementId = new Error('Uncountable element'); // We use this id for interface (no data) elements
    let newItemIds: any[],
        itemsMap: any,
        oldItemIds;

    if (trackFieldGetter) {
        oldItemIds = elementsArr.map((element: any) => element.hasOwnProperty('data') ? track(element.data) : uncountableElementId);
        newItemIds = [];
        itemsMap = new Map(); //trackFieldGetter can return original item by default
        newItems.forEach(item => {
            const itemId = track(item);

            itemsMap.set(itemId, item); // Save item for fast later retrieval
            newItemIds.push(itemId);
        });

    } else {
        oldItemIds = elementsArr.map((element: any) => element.hasOwnProperty('data') ? element.data : uncountableElementId);
        newItemIds = newItems.slice();
    }

    // Make undefined items for elements which are out of the list (have no data)
    oldItemIds.forEach((oldElementId: any) => {
        if (oldElementId === uncountableElementId) {
            newItemIds[appendUndefinedItems ? 'push' : 'unshift'](uncountableElementId);
        } else {
            appendUndefinedItems = true;
        }
    });

    const instructions = myer.diff(oldItemIds, newItemIds);
    const operations = instructions.map((args: any) => { //convert id to element for insert operations
        if (args.hasOwnProperty(2)) { //if we have ids for new elements
            return args.map((arg: any, i: number) => i < 2 ? arg : elementConstructor(itemsMap ? itemsMap.get(arg) : arg));
        }
        return args;
    });

    operations.forEach((operation: any) => {
        if (operation.hasOwnProperty(1)) {
            removeElements(containerElement, operation[0], operation[1]);
        }

        if (operation.hasOwnProperty(2)) {
            addElements(containerElement, operation[0], operation.slice(2))
        }
    });

    return containerElement;
}

function removeElements(containerElement: HTMLElement, startIndex: number, amount: number) {
    const children = containerElement.children;

    for (let i = 0; i < amount; i++) {
        children[startIndex].remove();
    }
}

function addElements(containerElement: HTMLElement, startIndex: number, newElements: HTMLElement[]) {
    const children = containerElement.children;

    if (startIndex) {
        children[startIndex - 1].after.apply(children[startIndex - 1], newElements);
    } else {
        containerElement.prepend.apply(containerElement, newElements)
    }
}

/**
 * Replace field value in deep object
 *
 * @param oldVal
 * @param newVal
 * @param {Object} object
 * @returns {{} & Object}
 */
export function deepReplace(oldVal: any, newVal: any, object: any) {
    const newObject: any = copy(object);

    Object.keys(object).forEach(key => {
        const val = object[key];

        if (val === oldVal) {
            newObject[key] = newVal;

        } else if (val != null && typeof val === 'object') {
            newObject[key] = deepReplace(oldVal, newVal, val);
        }
    });

    return newObject;
}

/**
 * Deep copy
 *
 * @param {Object} obj
 * @returns {Array | {}}
 */
function copy(obj: any) {
    const clone: any = {};

    for(let i in obj) {
        if (obj[i] != null && typeof obj[i] === 'object') {
            clone[i] = copy(obj[i]);
        } else {
            clone[i] = obj[i];
        }
    }
    return clone;
}

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
export function deepFind(obj: any, path: string, originalIfNotFound?: boolean) {
    if (!path || typeof obj !== 'object') return originalIfNotFound ? obj : undefined;

    const paths = path.split('.');
    let i, current = obj;

    for (i = 0; i < paths.length; ++i) {
        if (current[paths[i]] == undefined) {
            return undefined;
        } else {
            current = current[paths[i]];
        }
    }
    return current;
}

/**
 * Highlight `substr` in `str` by `<mark>` or custom tag
 *
 * @param {string} str
 * @param {string} substr
 * @param {string} tagName. `mark` by default
 * @returns {string} highlighted string
 */
export function highlight(str: string = '', substr: string = '', tagName?: string) {
    const tagTemplate = tagName ? `<${tagName}>$&</${tagName}>` : `<mark>$&</mark>`;
    let html = str;

    substr = String(substr);

    if (substr.length > 0) {
        str = String(str);
        substr = escapeCharacters(substr);

        html = str.replace(new RegExp(substr, 'gi'), tagTemplate);
    }

    return html;
}

/**
 * Debounce and extract target value from event
 * Useful for shadow-dom case when universal debounce works incorrect
 * @param fn
 * @param timeout
 * @returns {(e) => any}
 */
export function debounceEventValue(fn: Function, timeout: number) {
    let timer: ReturnType<typeof setTimeout> = null;

    return function (e: Event) {
        // Save `e.target.value` to value because `e` will be changed in shadow-dom case
        const value = (e.target as any).value;
        const onComplete = () => {
            fn.call(this, value);
            timer = null;
        };

        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(onComplete, timeout);
    };
}

// Getters
export function getItemsByField(fields: any, items: any[], fieldGetter: Function) {
    fields = Array.isArray(fields) ? fields : [fields];

    return fields.map((field: string) => {
        return items.find(item => fieldGetter(item) === field);
    }).filter((item: any) => item);
}

export const noopPipe = (item?: any) => item;
export const noop = (item?: any) => {};


/**
 * Cache value for '' query and last value
 */
export class QueryCache {
    private cache: {q: string, v: any, t: number}[] = [];

    get(query: string = '') {
        return this.getValue(this.cache.find(cacheItem => cacheItem.q === query));
    }

    getLast() {
        return this.getValue(this.cache[0]);
    }

    set(query: string = '', value: any) {
        // Remove duplicates, remove all except ''
        this.cache = this.cache.filter(cacheItem => cacheItem.q !== query && cacheItem.q === '');

        this.cache.unshift({q: query, v: value, t: (new Date().getTime())})
    }

    clear() {
        this.cache = [];
    }

    private getValue(cacheItem: any) {
        if (cacheItem) {
            return cacheItem.v;
        }
    }
}

