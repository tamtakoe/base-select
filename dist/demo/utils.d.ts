export declare const originalItems: any[];
export declare function noop(): void;
export declare function fnToStr(fn: any, space?: number): string;
export declare function hashFnv32a(str: any, asString?: any, seed?: any): string | number;
export declare function toArray(arrayLike: any): any[];
export declare function setEnabledDisabled(inputElement: any, enabled: any, lastValues?: {}, isNumber?: any): void;
export declare function updateCheckboxInput(field: any, checkboxElement: any, inputElement: any, setParams: any, isNumber?: any): void;
export declare function showElement(...args: any[]): void;
export declare function hideElement(...args: any[]): void;
export declare function addErrorClass(...args: any[]): void;
export declare function removeErrorClass(...args: any[]): void;
export declare function createValue(items?: any[], amount?: any, isSimple?: boolean): any;
export declare function randomId(length?: number): string;
export declare function getRandomItems(originalItems: any, amount: any, isFlat: any): any[];
export declare function createGetter(items: any, timeout?: number): (query: any) => Promise<{}>;
export declare function fnGroupToggleListener(fnGroupElement: any, fnStorage: any, fieldName: any, e: any): void;
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
declare class JSONFN {
    stringify(obj: any): string;
    parse(str: any, date2obj?: any): any;
    clone(obj: any, date2obj?: any): any;
}
export declare const JSONfn: JSONFN;
export {};
