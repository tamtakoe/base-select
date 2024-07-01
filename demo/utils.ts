import { ascSort } from '../src/utils';
import * as shopArr from './demo-data.json'

export const originalItems = toArray(shopArr);

export function noop() {}

const windowRef = typeof window !== 'undefined' ? window : null

function roundToEven(x: number) {
    return x % 2 ? x + 1 : x
}

function greatestCommonDivisor(arr: number[]) {
    let x = Math.abs(arr[0]);

    for (let i = 1; i < arr.length; i++) {
        let y = Math.abs(arr[i]);

        while (x && y) { x > y ? x %= y : y %= x; }
        x += y;
    }

    return x;
}

export function fnToStr(fn: Function, space?: number) {
    const spaceStr = '          ';
    let fnStr = String(fn);

    // Remove excess start spaces
    const minCountOfSpaces = Math.min.apply(Math, fnStr.split('\n').map(line => line.search(/\S/)).filter(n => n));
    const startSpacesRregexp = new RegExp(`^(\\s{${minCountOfSpaces}})(.*)$`, 'gm');
    fnStr = fnStr.replace(startSpacesRregexp, '$2');

    if (space === undefined) return fnStr;

    // Change tab size
    const spaces = fnStr.split('\n').map(line => line.search(/\S/)).filter(n => n);
    const currentSpace = greatestCommonDivisor(spaces.map(roundToEven));
    const spaceRregexp = new RegExp(`[ \\f\\r\\t\\\u00a0\\\u1680​\\\u180e\\\u2000​\\\u2001\\\u2002​\\\u2003\\\u2004​\\\u2005\\\u2006​\\\u2007\\\u2008​\\\u2009\\\u200a​\\\u2028\\\u2029​​\\\u202f\\\u205f​\\\u3000]{${currentSpace}}`, 'gm');

    return fnStr.replace(spaceRregexp, spaceStr.slice(0, space));
}

export function hashFnv32a(str: string, asString = false, seed?: any) {
    /*jshint bitwise:false */
    let i = 0, l = 0,
        hval = (seed === undefined) ? 0x811c9dc5 : seed;

    for (i = 0, l = str.length; i < l; i++) {
        hval ^= str.charCodeAt(i);
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    if( asString ){
        // Convert to 8 digit hex string
        return ("0000000" + (hval >>> 0).toString(16)).substr(-8);
    }
    return hval >>> 0;
}

export function toArray(arrayLike: any) {
    const array: any[] = [];
    for (let i = 0; ; i++) {
        if (!arrayLike[i]) break;

        array.push(arrayLike[i]);
    }

    return array;
}

export function setEnabledDisabled(inputElement: HTMLInputElement, enabled: boolean, lastValues: any = {}, isNumber = false) {
    inputElement.disabled = !enabled;

    if (inputElement.disabled) {
        lastValues[inputElement.id] = inputElement.value;
        inputElement.value = isNumber ? '' : 'undefined';

    } else if (lastValues[inputElement.id] !== undefined) {
        inputElement.value = lastValues[inputElement.id];

    } else {
        inputElement.value = '';
    }
}

//TODO rename to updateParams
export function updateCheckboxInput(field: string, checkboxElement: HTMLInputElement, inputElement: HTMLInputElement, setParams: any, isNumber = false) {
    const options: any = {};

    options[field] = checkboxElement.checked ? (isNumber ? Number(inputElement.value) : inputElement.value) : undefined;
    setParams(options);
}

export function showElement(...args: any[]) {
    args.forEach(element => element && element.classList.remove('hide'));
}

export function hideElement(...args: any[]) {
    args.forEach(element => element && element.classList.add('hide'));
}

export function addErrorClass(...args: any[]) {
    args.forEach(element => element && element.classList.add('error'));
}

export function removeErrorClass(...args: any[]) {
    args.forEach(element => element && element.classList.remove('error'));
}

export function createValue(items: any[] = [], amount: any = 0, isSimple?: boolean) {
    items = items.slice();

    // Repair item object if item is string
    if (typeof items[0] === 'string') {
        for (let i = 0; i < items.length; i++) {
            for (let j = 0; j < originalItems.length; j++) {
                if (items[i].indexOf(originalItems[j].name) > -1) {
                    const name = items[i];
                    items[i] = Object.assign({}, originalItems[j]);
                    items[i].id = i;
                    items[i].name = name;
                    break;
                }
            }
        }
    }

    // Add items from original if item list less then items in value
    if (originalItems) {
        while (items.length < Number(amount)) {
            items.push(originalItems[items.length])
        }
    }

    const result = items.slice(0, amount ? Number(amount) : 1).map(item => isSimple ? item.name : item);

    return amount ? result : result[0];
}

export function randomId(length = 5) {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, length);
}

export function getRandomItems(originalItems: any[], amount: number, isFlat: boolean) {
    amount = Number(amount);
    const newArr: any[] = [];

    for (let i = 1; i <= amount; i++) {
        const index = Math.ceil(Math.random() * (originalItems.length - 1));
        let newItem: any = Object.assign({}, originalItems[index]);

        newItem.name = newItem.name + '-' + randomId(String(amount).length).toUpperCase();

        if (isFlat) {
            newItem = newItem.name;
        } else {
            newItem.id = i;
        }

        newArr.push(newItem);
    }

    return newArr;
}

export function createGetter(items: any[], timeout = 1) {
    return function getItems(query: any) {
        console.log('query:', query);
        let options: any;

        if (typeof query === 'object' && query.hasOwnProperty('query')) {
            options = query;
            query = query.query;
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(ascSort(items, query, (item: any) => item.name, options));
            }, Number(timeout) * 1000)
        })
    }
}

export function fnGroupToggleListener(fnGroupElement: HTMLElement, fnStorage: any, fieldName: string, e: Event) {
    const element: HTMLElement = e.target as HTMLElement;
    const isActive = element.classList.contains('active');

    Array.from(fnGroupElement.querySelectorAll('.active')).forEach((element: any) => element.classList.remove('active'));

    if (!isActive) {
        element.classList.add('active');
        fnStorage.show(fieldName);

    } else {
        fnStorage.hide(fieldName);
    }

    e.preventDefault();
}

/**
 * JSONfn - javascript (both node.js and browser) plugin to stringify,
 *          parse and clone objects with Functions, Regexp and Date.
 *
 * Version - 1.1.0
 * Copyright (c) Vadim Kiryukhin
 * vkiryukhin @ gmail.com
 * http://www.eslinstructor.net/jsonfn/
 *
 * Licensed under the MIT license ( http://www.opensource.org/licenses/mit-license.php )
 *
 *   USAGE:
 *     browser:
 *         JSONfn.stringify(obj);
 *         JSONfn.parse(str[, date2obj]);
 *         JSONfn.clone(obj[, date2obj]);
 *
 *     nodejs:
 *       var JSONfn = require('path/to/json-fn');
 *       JSONfn.stringify(obj);
 *       JSONfn.parse(str[, date2obj]);
 *       JSONfn.clone(obj[, date2obj]);
 *
 *
 *     @obj      -  Object;
 *     @str      -  String, which is returned by JSONfn.stringify() function;
 *     @date2obj - Boolean (optional); if true, date string in ISO8061 format
 *                 is converted into a Date object; otherwise, it is left as a String.
 */
class JSONFN {
    stringify(obj: any) {
        return JSON.stringify(obj, function (key, value) {
            let fnBody;

            if (value instanceof Function || typeof value == 'function') {
                fnBody = value.toString();

                if (fnBody.length < 8 || fnBody.substring(0, 8) !== 'function') { //this is ES6 Arrow Function
                    return '_NuFrRa_' + fnBody;
                }
                return fnBody;
            }
            if (value instanceof RegExp) {
                return '_PxEgEr_' + value;
            }
            return value;
        });
    };

    parse(str: string, date2obj?: boolean) {
        if (!str) {
            return
        }
        const iso8061 = date2obj ? /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/ : false;
// debugger
        return JSON.parse(str, function (key, value) {
            let prefix;

            if (typeof value != 'string') {
                return value;
            }
            if (value.length < 8) {
                return value;
            }

            prefix = value.substring(0, 8);

            if (iso8061 && value.match(iso8061)) {
                return new Date(value);
            }
            if (prefix === 'function') {
                return eval('(' + value + ')');
            }
            if (prefix === '_PxEgEr_') {
                return eval(value.slice(8));
            }
            if (prefix === '_NuFrRa_') {
                return eval(value.slice(8));
            }

            return value;
        });
    };

    clone(obj: any, date2obj?: any) {
        return this.parse(this.stringify(obj), date2obj);
    };
}

export const JSONfn = new JSONFN();

export function getUrlQueryValue(paramName: string) {
    const urlParams = new URLSearchParams(windowRef.location.search);
    const value = urlParams.get(paramName);
    return value === 'false' ? false : (value === 'true' ? true : value);
}