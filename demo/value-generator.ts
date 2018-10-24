import template from './value-generator.html';
import {showElement, hideElement, createValue} from './utils';
import {CodeArea} from './code-area'
import {RadioGroup} from './radio-group'

export class ValueGenerator {

    constructor(containerElement, setParams, getLoadedItems, updateValue) {
        containerElement.innerHTML = String(template);

        const codeAreaElement: any = containerElement.querySelector('.example-code-area');
        const valueItemCustomElement: any = containerElement.querySelector('.value-item-custom-radio-group');
        const valueItemPredefinedGroup: any = containerElement.querySelector('#valueItemPredefinedGroup');
        const valueItemArrayElement: any = containerElement.querySelector('#valueItemArray');
        const valueItemArrayGroupElement: any = containerElement.querySelector('#valueItemArrayGroup');
        const valueItemArrayAmountElement: any = containerElement.querySelector('#valueItemArrayAmount');
        const valueItemSimpleElement: any = containerElement.querySelector('#valueItemSimple');
        const cleanBtnValueElement: any = containerElement.querySelector('#cleanValueBtn');
        const loadBtnValueElement: any = containerElement.querySelector('#loadValueBtn');
        const valueDelayInputElement: any = containerElement.querySelector('#valueDelayInput');

        let predefinedValue = createValue(getLoadedItems(), false);
        let customValue;

        const codeArea = new CodeArea(codeAreaElement, {isJson: true, successCallback: (value) => customValue = value});

        codeArea.setCode(JSON.stringify(predefinedValue, null, 2));
        hideElement(valueItemArrayGroupElement);

        const radioGroup = new RadioGroup(valueItemCustomElement, [{
            label: 'Auto',
            value: true,
            checked: true
        }, {
            label: 'Custom',
        }], (value) => {
            if (value) {
                codeArea.editMode(false);
                showElement(valueItemPredefinedGroup);
            } else {
                codeArea.editMode(true);
                hideElement(valueItemPredefinedGroup);
                customValue = predefinedValue;
            }
        });

        valueItemArrayElement.addEventListener('change', (e: any) => {
            if (e.target.checked) {
                showElement(valueItemArrayGroupElement);
                predefinedValue = createValue(getLoadedItems(), valueItemArrayAmountElement.value, valueItemSimpleElement.checked);

            } else {
                hideElement(valueItemArrayGroupElement);
                predefinedValue = createValue(getLoadedItems(), false, valueItemSimpleElement.checked);
            }
            codeArea.setCode(JSON.stringify(predefinedValue, null, 2));
        });

        valueItemArrayAmountElement.addEventListener('input', (e: any) => {
            predefinedValue = createValue(getLoadedItems(), e.target.value, valueItemSimpleElement.checked);

            codeArea.setCode(JSON.stringify(predefinedValue, null, 2));
        });

        valueItemSimpleElement.addEventListener('change', (e: any) => {
            predefinedValue = createValue(getLoadedItems(), valueItemArrayElement.checked && valueItemArrayAmountElement.value, e.target.checked);
            codeArea.setCode(JSON.stringify(predefinedValue, null, 2));
        });

        loadBtnValueElement.addEventListener('click', () => {
            const value = radioGroup.value ? predefinedValue : customValue;

            setTimeout(() => {
                setParams({
                    value: value
                });
                updateValue(value);
            }, valueDelayInputElement.value * 1000)
        });

        cleanBtnValueElement.addEventListener('click', () => {
            setTimeout(() => {
                setParams({
                    value: null
                });
                updateValue(null);
            }, valueDelayInputElement.value * 1000)
        });
    }
}