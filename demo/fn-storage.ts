import template from './fn-storage.html';
import {CodeArea} from './code-area'
import {RadioGroup} from './radio-group'
import {showElement, hideElement, fnToStr, noop} from './utils';

export class FnStorage {
    elems: any = {};
    storage: any = {};
    radioGroups: any = {};

    constructor (containerElement, options:any = {}, callback:Function = noop) {
        this.elems.containerElement = containerElement;

        Object.keys(options).forEach(name => this.createGroup(name, options[name], callback));
    }

    createGroup(groupName, options, callback) {
        const groupElement: any = document.createElement('div');
        const radioGroupElement = document.createElement('div');
        const codeAreaElement = document.createElement('div');

        groupElement.style.height = codeAreaElement.style.height = 'inherit';

        const codeArea = new CodeArea(codeAreaElement, {
            hasSaveBtn: true,
            isFn: true,
            successCallback: (value) => callback({[groupName]: value}, options.find(option => option.value === undefined))
        });

        const radioGroup = new RadioGroup(radioGroupElement, options, (value) => {
            codeArea.editMode(!value, '');

            let textValue = value;

            if (textValue) {
                if (typeof textValue === 'function') {
                    textValue = fnToStr(textValue, 2)
                }
                codeArea.setCode(textValue);
            }

            if (value !== undefined) {
                callback({
                    [groupName]: typeof value === 'string' ? undefined : value
                }, Object.assign({groupName: groupName}, options.find(option => option.value === value)))
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

    set(params) {
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