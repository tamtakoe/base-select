import template from './radio-group.html';
import {randomId, hashFnv32a, noop} from './utils';

interface RadioOptions {
    checked?: boolean,
    label?: string,
    value?: any,
}

export class RadioGroup {
    name: string;
    valueMap: any = {};
    value: any;
    radioElements: HTMLInputElement[] = [];

    constructor (containerElement: HTMLElement, options: RadioOptions[], callback: Function = noop) {
        this.name = randomId();

        containerElement.innerHTML = String(template);

        const customizableRadioFormElement: any = containerElement.querySelector('.customizable-radio-form');

        customizableRadioFormElement.addEventListener('click', (e: any) => {
            this.value = this.valueMap[e.target.value];
            callback(this.value);
        });

        this.radioElements = options.map(option => {
            const radioElement: any = this.createRadioElement(option);

            customizableRadioFormElement.appendChild(radioElement);

            if (option.checked) {
                this.value = option.value;
                callback(this.value);
            }

            return radioElement.querySelector('input');
        });
    }

    createRadioElement(opt: RadioOptions = {}) {
        const valueHash = hashFnv32a(String(opt.value), true);
        const radioHtml =  `<label><input type="radio" name="${this.name}" value="${valueHash}" ${opt.checked ? 'checked=\"checked\"' : ''}/>${opt.label}</label>`;
        const radioFragment = document.createElement('div');

        this.valueMap[valueHash] = opt.value;
        radioFragment.innerHTML = radioHtml;

        return radioFragment.firstChild;
    }

    setValue(value: any) {
        if (value !== this.value) {
            const valueHash = Object.keys(this.valueMap).find(hash => this.valueMap[hash] === value);
            this.radioElements.forEach(radioElement => {
                radioElement.checked = radioElement.value === valueHash;
            });
            this.value = value
        }
    }
}