import template from './fn-storage.html';
import {CodeArea} from './code-area'
import {RadioGroup} from './radio-group'
import {showElement, hideElement, fnToStr, noop} from './utils';

const documentRef = typeof document !== 'undefined' ? document : null

export class FnStorage {
    elems: any = {};
    storage: any = {};
    radioGroups: any = {};

    constructor (containerElement: HTMLElement, options:any = {}, callback: Function = noop) {
        this.elems.containerElement = containerElement;

        Object.keys(options).forEach(name => this.createGroup(name, options[name], callback));
    }

    createGroup(groupName: string, options: any, callback: Function) {
        const groupElement: any = documentRef.createElement('div');
        const radioGroupElement = documentRef.createElement('div');
        const codeAreaElement = documentRef.createElement('div');

        groupElement.style.height = codeAreaElement.style.height = 'inherit';

        const codeArea = new CodeArea(codeAreaElement, {
            hasSaveBtn: true,
            isFn: true,
            successCallback: (value: any) => callback({[groupName]: value}, options.find((option: any) => option.value === undefined))
        });

        const radioGroup = new RadioGroup(radioGroupElement, options, (value: any) => {
            codeArea.editMode(!value, '');

            let textValue = value;

            if (textValue) {
                if (typeof textValue === 'function') {
                    textValue = fnToStr(textValue, 2)
                }
                codeArea.setCode(textValue);
            }

            if (value !== undefined) {
                callback(
                    {
                        [groupName]: (typeof value === 'string' ? undefined : value)
                    }, 
                    Object.assign({groupName: groupName}, options.find(((option: any) => option.value === value)))
                )
            }
        });

        groupElement.append(radioGroupElement, codeAreaElement);
        hideElement(groupElement);
        this.elems.containerElement.appendChild(groupElement);
        this.storage[groupName] = {element: groupElement, radioGroup: radioGroup, codeArea: codeArea};
    }

    show(name: string) {
        const groupElement = this.storage[name].element;

        if (!groupElement) return console.error('No element for this name');

        this.hideAll();
        showElement(groupElement);
    }

    hide(name: string) {
        const groupElement = this.storage[name].element;

        if (!groupElement) return console.error('No element for this name');
        hideElement(groupElement);
    }

    hideAll() {
        Object.keys(this.storage).forEach(group => hideElement(this.storage[group].element))
    }

    set(params: any) {
        Object.keys(params).forEach(field => {
            const group = this.storage[field];
            const value = params[field];

            if (group && value) {
                const fnStr = fnToStr(value, 2);
                group.codeArea.editMode(true, fnStr);
                group.radioGroup.setValue(undefined)
            }
        })
    }
}