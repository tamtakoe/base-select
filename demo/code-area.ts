import template from './code-area.html';
import {showElement, hideElement, addErrorClass, removeErrorClass, noop} from './utils';


export class CodeArea {
    elems: any = {};
    isEditMode = false;
    options: any;

    constructor (containerElement, options?: {isJson?:boolean, isFn?:boolean, hasSaveBtn?:boolean, successCallback?:Function, errorCallback?:Function}) {
        this.options = options = Object.assign({inputCallback: noop, errorCallback: noop}, options);
        containerElement.innerHTML = String(template);

        this.elems.preCodeAreaElement = containerElement.querySelector('.pre-code-area');
        this.elems.textCodeAreaElement = containerElement.querySelector('.text-code-area');
        this.elems.textCodeSaveBtnElement = containerElement.querySelector('.text-code-save-btn');

        hideElement(this.elems.textCodeAreaElement, this.elems.textCodeSaveBtnElement);

        this.elems.textCodeAreaElement.addEventListener('input', (e: any) => {
            const value = this.getValidValue(); // For validation

            if (value && !options.hasSaveBtn) {
                options.successCallback(value);
            }
        });

        this.elems.textCodeSaveBtnElement.addEventListener('click', (e: any) => {
            const value = this.getValidValue();

            if (value && options.hasSaveBtn) {
                options.successCallback(value);
            }
        })
    }

    getValidValue() {
        let value = this.elems.textCodeAreaElement.value;

        try {
            if (this.options.isJson) {
                value = JSON.parse(value);
            }
            if (this.options.isFn) {
                value = new Function('return ' + value)()
            }
            removeErrorClass(this.elems.textCodeAreaElement);
            return value;

        } catch (e) {
            this.options.errorCallback(e);
            addErrorClass(this.elems.textCodeAreaElement);
        }
    }

    setCode(code: string = '') {
        this.elems.preCodeAreaElement.innerText = code;
    }

    editMode(isEditMode: boolean, initialValue?: string) {
        if (isEditMode && !this.isEditMode) {
            hideElement(this.elems.preCodeAreaElement);
            showElement(this.elems.textCodeAreaElement, this.options.hasSaveBtn && this.elems.textCodeSaveBtnElement);

            this.elems.textCodeAreaElement.innerHTML = initialValue || initialValue === '' ? initialValue : this.elems.preCodeAreaElement.innerText;

        } else if (!isEditMode && this.isEditMode) {
            showElement(this.elems.preCodeAreaElement);
            hideElement(this.elems.textCodeAreaElement, this.elems.textCodeSaveBtnElement);
        }

        this.isEditMode = isEditMode;
    }
}