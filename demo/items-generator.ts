import template from './items-generator.html';
import {showElement, hideElement, createValue, getRandomItems, createGetter} from './utils';
import {CodeArea} from './code-area'

export class ItemsGenerator {
    constructor(containerElement, originalItems, setParams, setLoadedItems) {
        containerElement.innerHTML = String(template);

        const codeAreaElement: any = containerElement.querySelector('.example-code-area');
        const itemsAmountInputElement: any = containerElement.querySelector('#itemsAmountInput');
        const itemsSimpleCheckboxElement: any = containerElement.querySelector('#itemsSimpleCheckbox');
        const itemsGetterCheckboxElement: any = containerElement.querySelector('#itemsGetterCheckbox');
        const itemsGetterGroupElement: any = containerElement.querySelector('#itemsGetterGroup');
        const itemsGetterTimeoutInputElement: any = containerElement.querySelector('#itemsGetterTimeoutInput');
        const itemsGetterPaginationCheckboxElement: any = containerElement.querySelector('#itemsGetterPaginationCheckbox');
        const clearItemsBtnElement: any = containerElement.querySelector('#cleanItemsBtn');
        const loadItemsBtnElement: any = containerElement.querySelector('#loadItemsBtn');
        const itemsDelayInputElement: any = containerElement.querySelector('#itemsDelayInput');

        const codeArea = new CodeArea(codeAreaElement);

        codeArea.setCode(JSON.stringify(createValue(originalItems, 3), null, 2).replace('\n]','\n  ...\n]'));
        hideElement(itemsGetterGroupElement);

        itemsSimpleCheckboxElement.addEventListener('change', (e: any) => {
            if (e.target.checked) {
                codeArea.setCode(JSON.stringify(createValue(originalItems, 3, true), null, 2).replace('\n]','\n  ...\n]'));

            } else {
                codeArea.setCode(JSON.stringify(createValue(originalItems, 3), null, 2).replace('\n]','\n  ...\n]'));
            }
        });

        itemsGetterCheckboxElement.addEventListener('change', (e: any) => {
            if (e.target.checked) {
                showElement(itemsGetterGroupElement);

            } else {
                hideElement(itemsGetterGroupElement);
            }
        });

        loadItemsBtnElement.addEventListener('click', () => {
            const loadedItems = getRandomItems(originalItems, itemsAmountInputElement.value, itemsSimpleCheckboxElement.checked);

            setTimeout(() => {
                if (itemsGetterCheckboxElement.checked) {
                    setParams({
                        getItems: createGetter(loadedItems, itemsGetterTimeoutInputElement.value)
                    })
                } else {
                    setParams({
                        items: loadedItems
                    })
                }
                setLoadedItems(loadedItems);

            }, itemsDelayInputElement.value * 1000);
        });

        clearItemsBtnElement.addEventListener('click', () => {
            setTimeout(() => {
                setParams({
                    items: null
                })
            }, itemsDelayInputElement.value * 1000);
        });
    }
}