import template from './edit-n-create.html';
import {fnGroupToggleListener} from './utils';

import {FnStorage} from './fn-storage'

export class EditAndCreate {
    elems: any = {};
    fnStorage: any;
    
    constructor(containerElement: HTMLElement, setParams: any, lastValues: any = {}) {
        containerElement.innerHTML = String(template);

        this.elems.editableCheckboxElement = containerElement.querySelector('#editableCheckbox');
        this.elems.creatableCheckboxElement = containerElement.querySelector('#creatableCheckbox');
        this.elems.removableCheckboxElement = containerElement.querySelector('#removableCheckbox');

        this.elems.editItemFnCheckboxElement = containerElement.querySelector('#editItemFnCheckbox');
        this.elems.createItemFnCheckboxElement = containerElement.querySelector('#createItemFnCheckbox');
        this.elems.removeItemFnCheckboxElement = containerElement.querySelector('#removeItemFnCheckbox');

        this.elems.editItemFnLabelElement = containerElement.querySelector('#editItemFnLabel');
        this.elems.createItemFnLabelElement = containerElement.querySelector('#createItemFnLabel');
        this.elems.removeItemFnLabelElement = containerElement.querySelector('#removeItemFnLabel');

        this.elems.fnStorageElement = containerElement.querySelector('.fn-storage');
        this.elems.editAndCreateFnGroupElement = containerElement.querySelector('#editAndCreateFnGroup');

        this.fnStorage = new FnStorage(this.elems.fnStorageElement, {
            editItemFn: [{
                label: 'Default',
                value: '(value) => this.setQuery(value, true)',
                checked: true
            }, {
                label: 'Example',
                value: function (value: any) {
                    this.setPlaceholder(value)
                }
            }, {
                label: 'Custom'
            }],
            createItemFn: [{
                label: 'Default',
                value: "typeof params.creatable === 'object' \n? (query) => deepReplace('$query', query, params.creatable) \n: (query) => query;",
                checked: true
            }, {
                label: 'Example',
                value: function (query: string) {
                    const _this = this;

                    _this.counter = _this.counter || 100;
                    _this.counter++;

                    return new Promise(resolve => {
                        setTimeout(() => {
                            resolve({
                                id: _this.counter,
                                name: query + '-' + _this.counter,
                                category: "shoes"
                            })
                        }, 1000)
                    });
                }
            }, {
                label: 'Custom'
            }],
            removeItemFn: [{
                label: 'Default',
                value: '(item) => {}',
                checked: true
            }, {
                label: 'Example',
                value: function (item: any) {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            resolve(`${item.name} removed`)
                        }, 1000)
                    });
                }
            }, {
                label: 'Custom'
            }]
        }, (changedParams: Function, options: any) => {
            const isDefault = String(options.label).toLowerCase() === 'default';

            switch (options.groupName) {
                case 'editItemFn':
                    this.elems.editItemFnCheckboxElement.checked = !isDefault;
                    break;
                case 'createItemFn':
                    this.elems.createItemFnCheckboxElement.checked = !isDefault;
                    break;
                case 'removeItemFn':
                    this.elems.removeItemFnCheckboxElement.checked = !isDefault;
                    break;
            }
            // changedParams = removeDisabled(changedParams);

            if (changedParams) {
                setParams(changedParams)
            }
        });

        const createGroupToggleListener = (field: string) => fnGroupToggleListener.bind(this, this.elems.editAndCreateFnGroupElement, this.fnStorage, field);

        this.elems.editItemFnLabelElement.addEventListener('click', createGroupToggleListener('editItemFn'));
        this.elems.editableCheckboxElement.addEventListener('change', (e: any) => {
            setParams({
                editable: e.target.checked
            })
        });

        this.elems.createItemFnLabelElement.addEventListener('click', createGroupToggleListener('createItemFn'));
        this.elems.creatableCheckboxElement.addEventListener('change', (e: any) => {
            setParams({
                creatable: e.target.checked
            })
        });

        this.elems.removeItemFnLabelElement.addEventListener('click', createGroupToggleListener('removeItemFn'));
        this.elems.removableCheckboxElement.addEventListener('change', (e: any) => {
            setParams({
                removable: e.target.checked
            })
        });
    }

    set(params: any, updateGetters?: boolean) {
        // Flags
        this.elems.editableCheckboxElement.checked  = params.editable;
        this.elems.creatableCheckboxElement.checked = params.creatable;
        this.elems.removableCheckboxElement.checked = params.removable;

        // Getters
        this.elems.editItemFnCheckboxElement.checked       = !!params.editItemFn;
        this.elems.createItemFnCheckboxElement.checked     = !!params.createItemFn;
        this.elems.removeItemFnCheckboxElement.checked     = !!params.removeItemFn;

        if (updateGetters) {
            this.fnStorage.set(params)
        }

    }
}