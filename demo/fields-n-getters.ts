import template from './fields-n-getters.html';
import {FnStorage} from './fn-storage'
import {setEnabledDisabled, fnGroupToggleListener, JSONfn} from './utils';

export class FieldsAndGetters {
    elems: any = {};
    fnStorage: any;
    
    constructor (containerElement: HTMLElement, setParams: Function, lastValues: any = {}) {
        containerElement.innerHTML = String(template);

        // Fields
        this.elems.valueFieldCheckboxElement             = containerElement.querySelector('#valueFieldCheckbox');
        this.elems.groupFieldCheckboxElement             = containerElement.querySelector('#groupFieldCheckbox');
        this.elems.searchFieldCheckboxElement            = containerElement.querySelector('#searchFieldCheckbox');
        this.elems.trackFieldCheckboxElement             = containerElement.querySelector('#trackFieldCheckbox');
        this.elems.disabledFieldCheckboxElement          = containerElement.querySelector('#disabledFieldCheckbox');
        this.elems.selectedItemLabelFieldCheckboxElement = containerElement.querySelector('#selectedItemLabelFieldCheckbox');
        this.elems.dropdownItemLabelFieldCheckboxElement = containerElement.querySelector('#dropdownItemLabelFieldCheckbox');

        this.elems.valueFieldInputElement                = containerElement.querySelector('#valueFieldInput');
        this.elems.groupFieldInputElement                = containerElement.querySelector('#groupFieldInput');
        this.elems.searchFieldInputElement               = containerElement.querySelector('#searchFieldInput');
        this.elems.trackFieldInputElement                = containerElement.querySelector('#trackFieldInput');
        this.elems.disabledFieldInputElement             = containerElement.querySelector('#disabledFieldInput');
        this.elems.selectedItemLabelFieldInputElement    = containerElement.querySelector('#selectedItemLabelFieldInput');
        this.elems.dropdownItemLabelFieldInputElement    = containerElement.querySelector('#dropdownItemLabelFieldInput');

        // Handlers
        this.elems.valueFieldCheckboxElement.addEventListener('change', (e: any) => {
            setEnabledDisabled(this.elems.valueFieldInputElement, e.target.checked, lastValues);
            setParams({
                valueField: this.elems.valueFieldCheckboxElement.checked ? this.elems.valueFieldInputElement.value : undefined
            });
        });

        this.elems.groupFieldCheckboxElement.addEventListener('change', (e: any) => {
            setEnabledDisabled(this.elems.groupFieldInputElement, e.target.checked, lastValues);
            setParams({
                groupField: this.elems.groupFieldCheckboxElement.checked ? this.elems.groupFieldInputElement.value : undefined
            });
        });

        this.elems.searchFieldCheckboxElement.addEventListener('change', (e: any) => {
            setEnabledDisabled(this.elems.searchFieldInputElement, e.target.checked, lastValues);
            setParams({
                searchField: this.elems.searchFieldCheckboxElement.checked ? this.elems.searchFieldInputElement.value : undefined
            });
        });

        this.elems.trackFieldCheckboxElement.addEventListener('change', (e: any) => {
            setEnabledDisabled(this.elems.trackFieldInputElement, e.target.checked, lastValues);
            setParams({
                trackField: this.elems.trackFieldCheckboxElement.checked ? this.elems.trackFieldInputElement.value : undefined
            });
        });

        this.elems.disabledFieldCheckboxElement.addEventListener('change', (e: any) => {
            setEnabledDisabled(this.elems.disabledFieldInputElement, e.target.checked, lastValues);
            setParams({
                disabledField: this.elems.disabledFieldCheckboxElement.checked ? this.elems.disabledFieldInputElement.value : undefined
            });
        });

        this.elems.selectedItemLabelFieldCheckboxElement.addEventListener('change', (e: any) => {
            setEnabledDisabled(this.elems.selectedItemLabelFieldInputElement, e.target.checked, lastValues);
            setParams({
                selectionLabelField: this.elems.selectedItemLabelFieldCheckboxElement.checked ? this.elems.selectedItemLabelFieldInputElement.value : undefined
            });
        });

        this.elems.dropdownItemLabelFieldCheckboxElement.addEventListener('change', (e: any) => {
            setEnabledDisabled(this.elems.dropdownItemLabelFieldInputElement, e.target.checked, lastValues);
            setParams({
                itemLabelField: this.elems.dropdownItemLabelFieldCheckboxElement.checked ? this.elems.dropdownItemLabelFieldInputElement.value : undefined
            });
        });

        this.elems.valueFieldInputElement.addEventListener('input', (e: Event) => {
            setParams({
                valueField: (e.target as any).value
            });
        });
        this.elems.groupFieldInputElement.addEventListener('input', (e: Event) => {
            setParams({
                groupField: (e.target as any).value
            });
        });
        this.elems.searchFieldInputElement.addEventListener('input', (e: Event) => {
            setParams({
                searchField: (e.target as any).value
            });
        });
        this.elems.trackFieldInputElement.addEventListener('input', (e: Event) => {
            setParams({
                trackField: (e.target as any).value
            });
        });
        this.elems.disabledFieldInputElement.addEventListener('input', (e: Event) => {
            setParams({
                disabledField: (e.target as any).value
            });
        });
        this.elems.selectedItemLabelFieldInputElement.addEventListener('input', (e: Event) => {
            setParams({
                selectionLabelField: (e.target as any).value
            });
        });
        this.elems.dropdownItemLabelFieldInputElement.addEventListener('input', (e: Event) => {
            setParams({
                itemLabelField:  (e.target as any).value
            });
        });

        // Getters
        this.elems.valueFieldGetterCheckboxElement        = containerElement.querySelector('#valueFieldGetterCheckbox');
        this.elems.groupFieldGetterCheckboxElement        = containerElement.querySelector('#groupFieldGetterCheckbox');
        this.elems.searchFieldGetterCheckboxElement       = containerElement.querySelector('#searchFieldGetterCheckbox');
        this.elems.trackFieldGetterCheckboxElement        = containerElement.querySelector('#trackFieldGetterCheckbox');
        this.elems.disabledFieldGetterCheckboxElement     = containerElement.querySelector('#disabledFieldGetterCheckbox');
        this.elems.dropdownItemLabelGetterCheckboxElement = containerElement.querySelector('#dropdownItemLabelGetterCheckbox');
        this.elems.selectedItemLabelGetterCheckboxElement = containerElement.querySelector('#selectedItemLabelGetterCheckbox');
        this.elems.groupLabelGetterCheckboxElement        = containerElement.querySelector('#groupLabelGetterCheckbox');
        this.elems.customAreaGetterCheckboxElement        = containerElement.querySelector('#customAreaGetterCheckbox');
        this.elems.inputInfoGetterCheckboxElement         = containerElement.querySelector('#inputInfoGetterCheckbox');

        this.elems.valueFieldGetterLabelElement           = containerElement.querySelector('#valueFieldGetterLabel');
        this.elems.groupFieldGetterLabelElement           = containerElement.querySelector('#groupFieldGetterLabel');
        this.elems.searchFieldGetterLabelElement          = containerElement.querySelector('#searchFieldGetterLabel');
        this.elems.trackFieldGetterLabelElement           = containerElement.querySelector('#trackFieldGetterLabel');
        this.elems.disabledFieldGetterLabelElement        = containerElement.querySelector('#disabledFieldGetterLabel');
        this.elems.dropdownItemLabelGetterLabelElement    = containerElement.querySelector('#dropdownItemLabelGetterLabel');
        this.elems.selectedItemLabelGetterLabelElement    = containerElement.querySelector('#selectedItemLabelGetterLabel');
        this.elems.groupLabelGetterLabelElement           = containerElement.querySelector('#groupLabelGetterLabel');
        this.elems.customAreaGetterLabelElement           = containerElement.querySelector('#customAreaGetterLabel');
        this.elems.inputInfoGetterLabelElement            = containerElement.querySelector('#inputInfoGetterLabel');

        this.elems.fnStorageElement                       = containerElement.querySelector('.fn-storage');
        this.elems.fieldsAndGettersFnGroupElement         = containerElement.querySelector('#fieldsAndGettersFnGroup');

        this.fnStorage = new FnStorage(this.elems.fnStorageElement, {
            valueFieldGetter: [{
                label: 'Default',
                value: 'if (valueField) {\n' +
                '   return (item) => deepFind(item, valueField, true);\n' +
                '} else {\n' +
                '   return (item) => item\n' +
                '}',
                checked: true
            }, {
                label: 'Example',
                value: function (item: any) {
                    return item.name
                }
            }, {
                label: 'Custom'
            }],
            groupFieldGetter: [{
                label: 'Default',
                value: 'if (groupField) {\n' +
                '   return (item) => deepFind(item, groupField);\n' +
                '} else {\n' +
                '   return (item) => \'\'\n' +
                '}',
                checked: true
            }, {
                label: 'Example',
                value: function (item: any) {
                    return item.id
                }
            }, {
                label: 'Custom'
            }],
            searchFieldGetter: [{
                label: 'Default',
                value: 'if (searchField) {\n' +
                '   return (item) => deepFind(item, searchField, true);\n' +
                '} else {\n' +
                '   return (item) => item\n' +
                '}',
                checked: true
            }, {
                label: 'Example',
                value: function (item: any) {
                    return item.id
                }
            }, {
                label: 'Custom'
            }],
            trackFieldGetter: [{
                label: 'Default',
                value: 'if (trackField || valueField) {\n' +
                '   return (item) => deepFind(item, trackField || valueField, true);\n' +
                '} else {\n' +
                '   return (item) => item\n' +
                '}',
                checked: true
            }, {
                label: 'Example',
                value: function (item: any) {
                    return item.name
                }
            }, {
                label: 'Custom'
            }],
            disabledFieldGetter: [{
                label: 'Default',
                value: 'if (disabledField) {\n' +
                '   return (item) => deepFind(item, disabledField);\n' +
                '} else {\n' +
                '   return (item) => item\n' +
                '}',
                checked: true
            }, {
                label: 'Example',
                value: function (item: any) {
                    return item.id % 2
                }
            }, {
                label: 'Custom'
            }],
            dropdownItemLabelGetter: [{
                label: 'Default',
                value: 'if (dropdownItemLabelField || searchField) {\n' +
                '   return (item) => deepFind(item, dropdownItemLabelField || searchField, true);\n' +
                '} else {\n' +
                '   return (item) => item\n' +
                '}',
                checked: true
            }, {
                label: 'Example',
                value: function (item: any) {
                    return `<i>${item.name}</i>`
                }
            }, {
                label: 'Custom'
            }],
            selectedItemLabelGetter: [{
                label: 'Default',
                value: 'if (selectedItemLabelField || searchField) {\n' +
                '   return (item) => deepFind(item, selectedItemLabelField || searchField, true);\n' +
                '} else {\n' +
                '   return (item) => item\n' +
                '}',
                checked: true
            }, {
                label: 'Example',
                value: function (item: any) {
                    return `<span style="color: red">${item.name}</span>`
                }
            }, {
                label: 'Custom'
            }],
            groupLabelGetter: [{
                label: 'Default',
                value: '(label) => label',
                checked: true
            }, {
                label: 'Example',
                value: function (label: string) {
                    return `<i>${label}</i>`
                }
            }, {
                label: 'Custom'
            }],
            customAreaGetter: [{
                label: 'Default',
                value: '() => {}',
                checked: true
            }, {
                label: 'Example',
                value: function () {
                    const _this = this;
                    const customAreaElement = document.createElement('DIV');
                    customAreaElement.innerHTML = '<input><button>Clothes</button><button>Shoes</button><button>Other</button>';

                    const customAreaBtnElements = customAreaElement.querySelectorAll('button');
                    const customAreaClothesBtnElement = customAreaBtnElements[0];
                    const customAreaShoesBtnElement = customAreaBtnElements[1];
                    const customAreaOtherBtnElement = customAreaBtnElements[2];
                    const customAreaInputElement = customAreaElement.querySelector('input')!;

                    customAreaClothesBtnElement.addEventListener('click', (e: any) => {
                        _this.searchChange({query: 'clothes', fields: ['category']});
                    });

                    customAreaShoesBtnElement.addEventListener('click', (e: any) => {
                        _this.searchChange({query: 'shoes', fields: ['category']});
                    });

                    customAreaOtherBtnElement.addEventListener('click', (e: any) => {
                        _this.searchChange({query: undefined, fields: ['category']});
                    });

                    customAreaInputElement.addEventListener('input', (e: any) => {
                        _this.searchChange(e.target.value);
                    });

                    _this.bindInput(customAreaInputElement);

                    return customAreaElement;
                }
            }, {
                label: 'Custom'
            }],
            infoGetter: [{
                label: 'Default',
                value: '(hiddenItemsNumber) => ""',
                checked: true
            }, {
                label: 'Example',
                value: function (hiddenItemsNumber: number) {
                    return hiddenItemsNumber > 0 ? `and ${hiddenItemsNumber} more`: ''
                }
            }, {
                label: 'Custom'
            }],
        }, (changedParams: any, options: any) => {
            const isDefault = String(options.label).toLowerCase() === 'default';

            switch (options.groupName) {
                case 'valueFieldGetter':
                    this.elems.valueFieldGetterCheckboxElement.checked = !isDefault;
                    break;
                case 'groupFieldGetter':
                    this.elems.groupFieldGetterCheckboxElement.checked = !isDefault;
                    break;
                case 'searchFieldGetter':
                    this.elems.searchFieldGetterCheckboxElement.checked = !isDefault;
                    break;
                case 'trackFieldGetter':
                    this.elems.trackFieldGetterCheckboxElement.checked = !isDefault;
                    break;
                case 'disabledFieldGetter':
                    this.elems.disabledFieldGetterCheckboxElement.checked = !isDefault;
                    break;
                case 'dropdownItemLabelGetter':
                    this.elems.dropdownItemLabelGetterCheckboxElement.checked = !isDefault;
                    break;
                case 'selectedItemLabelGetter':
                    this.elems.selectedItemLabelGetterCheckboxElement.checked = !isDefault;
                    break;
                case 'groupLabelGetter':
                    this.elems.groupLabelGetterCheckboxElement.checked = !isDefault;
                    break;
                case 'customAreaGetter':
                    this.elems.customAreaGetterCheckboxElement.checked = !isDefault;
                    break;
                case 'infoGetter':
                    this.elems.inputInfoGetterCheckboxElement.checked = !isDefault;
                    break;
            }

            if (changedParams) {
                setParams(changedParams)
            }
        });

        const createGroupToggleListener = (field: string) => fnGroupToggleListener.bind(this, this.elems.fieldsAndGettersFnGroupElement, this.fnStorage, field);

        this.elems.valueFieldGetterLabelElement.addEventListener('click', createGroupToggleListener('valueFieldGetter'));
        this.elems.groupFieldGetterLabelElement.addEventListener('click', createGroupToggleListener('groupFieldGetter'));
        this.elems.searchFieldGetterLabelElement.addEventListener('click', createGroupToggleListener('searchFieldGetter'));
        this.elems.trackFieldGetterLabelElement.addEventListener('click', createGroupToggleListener('trackFieldGetter'));
        this.elems.disabledFieldGetterLabelElement.addEventListener('click', createGroupToggleListener('disabledFieldGetter'));
        this.elems.dropdownItemLabelGetterLabelElement.addEventListener('click', createGroupToggleListener('dropdownItemLabelGetter'));
        this.elems.selectedItemLabelGetterLabelElement.addEventListener('click', createGroupToggleListener('selectedItemLabelGetter'));
        this.elems.groupLabelGetterLabelElement.addEventListener('click', createGroupToggleListener('groupLabelGetter'));
        this.elems.customAreaGetterLabelElement.addEventListener('click', createGroupToggleListener('customAreaGetter'));
        this.elems.inputInfoGetterLabelElement.addEventListener('click', createGroupToggleListener('infoGetter'));
    }

    set(params: any) {
        // Fields
        this.elems.valueFieldCheckboxElement.checked             = !!params.valueField;
        this.elems.groupFieldCheckboxElement.checked             = !!params.groupField;
        this.elems.searchFieldCheckboxElement.checked            = !!params.searchField;
        this.elems.trackFieldCheckboxElement.checked             = !!params.trackField;
        this.elems.disabledFieldCheckboxElement.checked          = !!params.disabledField;
        this.elems.dropdownItemLabelFieldCheckboxElement.checked = !!params.itemLabelField;
        this.elems.selectedItemLabelFieldCheckboxElement.checked = !!params.selectionLabelField;

        setEnabledDisabled(this.elems.valueFieldInputElement, this.elems.valueFieldCheckboxElement.checked, {valueFieldInput: params.valueField});
        setEnabledDisabled(this.elems.groupFieldInputElement, this.elems.groupFieldCheckboxElement.checked, {groupFieldInput: params.groupField});
        setEnabledDisabled(this.elems.searchFieldInputElement, this.elems.searchFieldCheckboxElement.checked, {searchFieldInput: params.searchField});
        setEnabledDisabled(this.elems.trackFieldInputElement, this.elems.trackFieldCheckboxElement.checked, {trackFieldInput: params.trackField});
        setEnabledDisabled(this.elems.disabledFieldInputElement, this.elems.disabledFieldCheckboxElement.checked, {disabledFieldInput: params.disabledField});
        setEnabledDisabled(this.elems.dropdownItemLabelFieldInputElement, this.elems.dropdownItemLabelFieldCheckboxElement.checked, {dropdownItemLabelFieldInput: params.itemLabelField});
        setEnabledDisabled(this.elems.selectedItemLabelFieldInputElement, this.elems.selectedItemLabelFieldCheckboxElement.checked, {selectedItemLabelFieldInput: params.selectionLabelField});

        // Getters
        this.elems.valueFieldGetterCheckboxElement.checked        = !!params.valueFieldGetter;
        this.elems.groupFieldGetterCheckboxElement.checked        = !!params.groupFieldGetter;
        this.elems.searchFieldGetterCheckboxElement.checked       = !!params.searchFieldGetter;
        this.elems.trackFieldGetterCheckboxElement.checked        = !!params.trackFieldGetter;
        this.elems.disabledFieldGetterCheckboxElement.checked     = !!params.disabledFieldGetter;
        this.elems.dropdownItemLabelGetterCheckboxElement.checked = !!params.dropdownItemLabelGetter;
        this.elems.selectedItemLabelGetterCheckboxElement.checked = !!params.selectedItemLabelGetter;
        this.elems.groupLabelGetterCheckboxElement.checked        = !!params.groupLabelGetter;
        this.elems.customAreaGetterCheckboxElement.checked        = !!params.customAreaGetter;
        this.elems.inputInfoGetterCheckboxElement.checked         = !!params.infoGetter;

        this.fnStorage.set(params)
    }
}