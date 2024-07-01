import style from './select.scss?module';
// import bootstrapStyle from './select-bootstrap.scss';
import { SelectDom } from './dom-builder';
import {
    ascSort,
    findIndex,
    getItemsByField,
    deepReplace,
    highlight,
    deepFind,
    mergeWithDefaults,
    QueryCache
} from './utils';

const QUERY_PLACEHOLDER = '$query';

export class Select extends SelectDom {
    value: any;
    private cache = new QueryCache();
    loadItemsPromise: Promise<any>; //Just for case. We don't use it now

    constructor(element: HTMLElement, params: any = {}) {
        super(element, params.localStyle);
        this.setParams(params);
    }

    //добавить класс binded если используется другой инпут
    public setParams(params: any = {}, emitEvent: boolean = true) {
        // `emitEvent=false` prevents event emitting of value changes in situation if value was changed because multiple flag was changed
        console.log('setParams', params);
        mergeWithDefaults(this.params, params, this.paramsDefault);

        const hasProperty = (property: string) => params.hasOwnProperty(property);
        const hasFalsyProperty = (property: string) => params.hasOwnProperty(property) && !params[property];

        // Complex
        if (hasProperty('removable')) {
            this.params.openByRemove = !params.removable;
        }

        if (hasProperty('multiple')) {
            this.params.openByRemove = !params.multiple;
            this.params.openByActiveRemove = !params.multiple;
        }

        if (hasProperty('multiple') || hasProperty('readonly')) {
            this.params.editable = !this.params.readonly && !this.params.multiple;
        }

        if (hasProperty('keepOpened')) {
            this.params.openByRemove = params.keepOpened;
            this.params.closeByRemove = !params.keepOpened;
            this.params.closeBySelect = !params.keepOpened;
        }

        // Basic
        if (hasProperty('openByRemove')) {
            this.params.openByRemove = params.openByRemove
        }

        if (hasProperty('openByActiveRemove')) {
            this.params.openByActiveRemove = params.openByActiveRemove
        }

        if (hasProperty('openByInputClick')) {
            this.params.openByInputClick = params.openByInputClick
        }

        if (hasProperty('closeByRemove')) {
            this.params.closeByRemove = params.closeByRemove
        }

        if (hasProperty('closeBySelect')) {
            this.params.closeBySelect = params.closeBySelect
        }

        if (hasProperty('editable')) {
            this.params.editable = params.editable
        }

        // Field & Getters
        if (hasFalsyProperty('valueFieldGetter') && this.params.valueField || hasProperty('valueField')) { // Id or other unique value
            this.params.valueFieldGetter = (item: any) => deepFind(item, this.params.valueField, true);
        }

        if (hasFalsyProperty('groupFieldGetter') && this.params.groupField || hasProperty('groupField')) { // Group id
            this.params.groupFieldGetter = (item: any) => deepFind(item, this.params.groupField)
        }

        if (hasFalsyProperty('searchFieldGetter') && this.params.searchField || hasProperty('searchField')) { // Field for searching
            this.params.searchFieldGetter = (item: any) => deepFind(item, this.params.searchField, true);
        }

        if (hasFalsyProperty('trackFieldGetter') && (this.params.trackField || this.params.valueField) || hasProperty('trackField') || hasProperty('valueField')) { // Track id
            this.params.trackFieldGetter = (item: any) => deepFind(item, this.params.trackField || this.params.valueField, true);
        }

        if (hasFalsyProperty('disabledFieldGetter') && this.params.disabledField || hasProperty('disabledField')) { // Field with disabled flag
            this.params.disabledFieldGetter = (item: any) => deepFind(item, this.params.disabledField);
        }

        // if (hasProperty('groupField') && !params.groupLabelGetter) {
        //     this.params.groupLabelGetter = (label) => label
        // }

        if (hasFalsyProperty('dropdownItemLabelGetter') && (this.params.dropdownItemLabelField || this.params.searchField) || !params.dropdownItemLabelGetter && (hasProperty('dropdownItemLabelField') || hasProperty('searchField'))) {
            this.params.dropdownItemLabelGetter = (item: any, query: any) => highlight(deepFind(item, this.params.dropdownItemLabelField || this.params.searchField, true), query);
        }

        if (hasFalsyProperty('selectedItemLabelGetter') && (this.params.selectedItemLabelField || this.params.searchField) || !params.selectedItemLabelGetter && (hasProperty('selectedItemLabelField') || hasProperty('searchField'))) {
            this.params.selectedItemLabelGetter = (item: any) => deepFind(item, this.params.selectedItemLabelField || this.params.searchField, true)
        }

        if (hasProperty('placeholder') && !hasProperty('multiplePlaceholder')) {
            this.params.multiplePlaceholder = params.placeholder;
        }

        if (params.creatable && !params.createItemFn) {
            this.params.createItemFn = typeof params.creatable === 'object' ? (query: any) => deepReplace(QUERY_PLACEHOLDER, query, params.creatable) : (query: any) => query;
        }

        if (this.params.editable && !params.editItemFn) {
            this.params.editItemFn = (value: any) => this.setQuery(value, true);
        }

        if (!this.params.getItemsByValue) {
            // Find items by value in the items list
            this.params.getItemsByValue = (values: any[]) => {
                return this.loadListItems()
                    .then(items => getItemsByField(values, items, this.params.valueFieldGetter));
            }
        }

        if (hasProperty('items')) {
            this.params.getItems = (query: any) => {
                let options;

                if (typeof query === 'object' && query.hasOwnProperty('query')) {
                    options = query;
                    query = query.query;
                }
                return ascSort(params.items || [], query, this.params.searchFieldGetter, options)
            };
        }

        // Initialize
        let valueIsChanged = false;
        let value = this.value;

        this.setDropdownLabel(this.params.emptyDropdownLabel);
        this.setRemovable(this.params.removable);
        this.setMultiple(this.params.multiple);
        this.setReadonly(this.params.readonly);
        this.setDisabled(this.params.disabled);
        this.setDropdownAbove(this.params.position === 'top');
        this.updatePlaceholder();

        if ((hasProperty('selectedItemLabelGetter') || hasProperty('selectedItemLabelField') || hasProperty('searchField') || hasProperty('searchFieldGetter')) && this.selectedItems.length) {
            // Update items which are already selected. We don't need to update list items here because they will be updated when dropdown opening
            this.insertSelectedElements([]);
            this.insertSelectedElements(this.selectedItems);
        }

        if (hasProperty('customAreaGetter')) {
            this.insertCustomArea();
        }

        if (hasProperty('activeByOpen') && !params.activeByOpen) {
            this.setActiveListElement();
        }

        if (hasProperty('items') || hasProperty('getItems')) {
            this.cache.clear();

            // Case: loading implemented outside, not by select getItems. Then we should to show new items in open dropdown
            if (this.isOpen) {
                this.insertListItems([]);
                this.updateDropdownListItems('');
            }
        }

        if (hasProperty('value')) {
            value = params.value;
            valueIsChanged = true;
        }

        if (this.params.multiple && !Array.isArray(value)) {
            value = value != null ? [value] : [];
            valueIsChanged = true;
        }

        if (!this.params.multiple && Array.isArray(value)) {
            value = value[0]; // There is high probability that it is old multiple value then single array like value
            valueIsChanged = true;
        }

        if (valueIsChanged && this.value !== value) {
            this.value = value;
            this.setQuery(''); // Case: dropdown is open. Clear query if value was setup not by search input
            // Convert value to items (which are array always) and set them
            this.selectItems(this.params.multiple ? value : (value != null ? [value] : []))
                .then(this.updateInputInfo.bind(this));

            if (emitEvent && !hasProperty('value')) {
                this.dispatchValue();
            }
        }
    }

    public open() {
        if (this.isOpen) return;

        this.updateDropdownListItems('') //use saved query
            .then((data) => {
                this.openList();
                if (!this.params.multiple && this.selectedItems.length) {
                    // this.setPlaceholder(this.params.selectedItemLabelGetter(this.selectedItems[0]))
                    // this.setQuery(this.params.searchFieldGetter(this.selectedItems[0]), true);

                    // Doesn't work without setTimeout because of https://bugs.chromium.org/p/chromium/issues/detail?id=32865
                    setTimeout(() => {
                        this.params.editItemFn.call(this, this.params.searchFieldGetter(this.selectedItems[0]));
                    })
                }
            })
    }

    public close() {
        if (!this.params.multiple) {
            // this.setPlaceholder(this.params.placeholder);
            // this.setQuery();
            this.params.editItemFn.call(this, '');
        }

        if (!this.isOpen) return;

        this.closeList();
    }

    // Items loader
    loadListItems(query: any = '') {
        this.setLoading(true);
        // console.log('Loading... ', query, 'From cache:', !!this.cache.get(query));

        let cachedItems, selectedItemsForQuery;

        if (this.params.useCache) {
            cachedItems = this.cache.get(query);

        } else {
            // Needs to understand how many selected items we already have for this query
            // and how many extra items we need to request server.
            // Case: if server sends items by chunks/pages. In situation if we move most of received items
            // to selected list and have just several or zero items in the dropdown list
            // we need to request server more items or items except selected.
            let options;

            if (typeof query === 'object' && query.hasOwnProperty('query')) {
                options = query;
                query = query.query;
            }

            selectedItemsForQuery = ascSort(this.selectedItems, query, this.params.dropdownItemLabelGetter, options);
        }

        this.loadItemsPromise = Promise.resolve(cachedItems || this.params.getItems(query, selectedItemsForQuery))
            .then((items: any[]) => {
                // console.log('Loaded', items);
                this.cache.set(query, items);
                this.loadItemsPromise = undefined;
                this.setLoading(false);

                return items;
            })
            .catch(error => {
                this.loadItemsPromise = undefined;
                this.setLoading(false);
            });

        return this.loadItemsPromise;
    }

    updateDropdownListItems(query?: string) {
        // console.log('query', query);
        return this.loadListItems(query)
            .then((items) => {
                if (this.isDropdownAbove) {
                    items.reverse();
                }
                this.insertListItems(items, query);

                // const insertedItems = this.insertListItems(this.isDropdownAbove ? items.reverse() : items, query);
                // items.length - insertedItems.length;
                // if () {
                //
                // }
            })
        // .then(this.insertListItems.bind(this))
        // .then(() => {
        //     this.setActiveListElement(this.getFirstListElement());
        // })
    }

    saveOn(key: string) {
        if (this.activeListElement) {
            const parentNode = this.activeListElement.parentNode as HTMLElement;

            this.selectItem(this.activeListElement); //FIXME. This is bug. case: keepOpen + remove all
            this.setNextActiveListElement(null, parentNode);

        } else if (this.params.creatable) {
            const query = this.getQuery();
            if (!query) return;

            this.setLoading(true);

            Promise.resolve(this.params.createItemFn(query))
                .then(newItem => {
                    const newElement = this.createListItemElement(newItem);

                    this.setLoading(false);
                    this.selectItem(newElement, true);

                    if (this.params.activeByOpen) {
                        this.setNextActiveListElement();
                    }
                })
                .catch(error => {
                    this.setLoading(false);
                })
        }
    }

    // ValueView
    updateValue() {
        const values = this.params.valueField ? this.selectedItems.map(this.params.valueFieldGetter) : this.selectedItems;
        const newValue = this.params.multiple ? values.slice() : values[0];

        if (this.value !== newValue) {
            this.value = newValue;
            this.updatePlaceholder();
            this.updateInputInfo();
            this.dispatchValue();
        }
    }

    dispatchValue() {
        const event: any = new Event('change');

        event.value = this.value;
        this.elem.dispatchEvent(event);
    }

    // Item manipulations
    public selectItems(items: any[]) {
        // console.log('selectItems []', items);
        // if (!this.params.multiple && !items) {
        //   this.deselectAllItems();
        //   this.updateValue();
        //   return;
        // }

        return Promise.resolve(this.params.valueField ? this.params.getItemsByValue(items) : items)
            .then(items => {
                this.updateSelectedElementList(items);

                if (this.isFocused) {
                    // this.updateDropdownListItems(this.tmpl.searchInput.value); //только если дропдаун открыт
                    this.updateDropdownListItems(this.focusBlurInstance.inputElement.value); //только если дропдаун открыт
                }

                //this.updateValue();
            });
    }

    public selectItem(listItemElement: HTMLElement, isNewItem?: boolean) {
        // if (this.isElementDisabled(listItemElement)) return; //Should works without it

        const item = (listItemElement as any).data;

        // Multiple limit
        if (this.params.multipleLimit >= 0 && this.selectedItems.length >= this.params.multipleLimit) {
            this.blinkRestriction();
            return;
        }

        // Show selected items in the dropdown list case
        if (!this.params.hideSelected && this.isListElementSelected(listItemElement)) {
            const searchItemElement = this.getSelectedItemElementByItem(item);

            this.unsetListElementSelected(listItemElement);
            this.deselectItem(searchItemElement, true);
            return;
        }

        // Multiple/Single case
        if (this.params.multiple) {
            this.setActiveSelectedElement();
        } else {
            this.deselectAllItems();
            this.setQuery('');
        }

        if (isNewItem) {
            this.setQuery('');
        }

        this.addToSelectedElementList(item);

        // Stay dropdown opened/close case
        if (this.isOpen && this.params.closeBySelect) {
            this.close();
            this.setQuery('');

        } else {
            this.insertListItems(this.cache.get(this.getQuery()));
            // For visual performance. Remove selected element firstly, then get new items
            // if (!this.params.useCache) {
            //     this.insertListItems(this.cache.getLast());
            // }
            //
            // this.updateDropdownListItems(this.getQuery()); // Load items

            // Пришлось отключить из-за конфликта с newItems. Разобраться!!!
            // In case useCache=false we do it for visual performance. Remove selected item firstly, then get new items
            //this.insertListItems(this.cache.getLast());

            if (!this.params.useCache) {
                this.updateDropdownListItems(this.getQuery()); // Load items
            }
        }

        // this.currentElem = null;
        // itemElement.dispatchEvent(new Event('mouseout'));


        this.updateValue();
    }

    public deselectItem(selectedElement: HTMLElement, isRemoveButton = false) {
        const isMultipleEditable = this.params.editable && this.params.multiple;

        if (!this.params.multiple && this.isReadonly) { //Refactor this case!
            this.setActiveSelectedElement();
            if (isRemoveButton) {

                this.removeSelectedItem(selectedElement);
                this.setActiveSelectedElement();
                setTimeout(() => {
                    this.setQuery('');
                })

            }
            this.open();
            return
        }

        if (isMultipleEditable && selectedElement) {
            setTimeout(() => {
                this.params.editItemFn.call(this, this.params.searchFieldGetter((selectedElement as any).data));
            })
            // this.setQuery(this.params.searchFieldGetter(selectedElement.data))
            // this.params.editItemFn.bind(this)(this.params.searchFieldGetter(selectedElement.data));
        }

        if (isRemoveButton || selectedElement === this.activeSelectedElement || isMultipleEditable) {
            this.removeSelectedItem(selectedElement);
            this.setActiveSelectedElement();

        } else {
            this.setActiveSelectedElement(selectedElement);
            // console.log('deselectItem', this.params.openByActiveRemove);
            if (this.params.openByActiveRemove) {
                this.open();
            }
        }
    }

    public deselectAllItems() {
        this.updateSelectedElementList([]);
        //this.updateDropdownListItems(this.tmpl.searchInput.value); //??
        // this.updateValue();
    }


    updateSelectedElementList(items: any[] = []) {
        this.selectedItems = items;

        // if (this.selectedItems.length <= this.params.multipleVisibleLimit) {
        //     items = items.slice(0, this.params.multipleVisibleLimit)
        // }
        this.insertSelectedElements(items);
    }

    addToSelectedElementList(item: any) {
        this.selectedItems.push(item);
        this.insertSelectedElement(item);

        // if (this.selectedItems.length <= this.params.multipleVisibleLimit) {
        //     this.insertSelectedElement(item);
        // }
    }

    removeSelectedItem(selectedElement: HTMLElement) {
        if (!selectedElement) return;

        const selectedItem = (selectedElement as any).data;

        this.setElementLoading(selectedElement, true);

        Promise.resolve(this.params.removeItemFn(selectedItem))
            .then((success) => {
                const itemIndex = findIndex(this.selectedItems, selectedItem, this.params.trackFieldGetter);

                this.setElementLoading(selectedElement, false);
                this.selectedItems.splice(itemIndex, 1); //Объединить?
                this.removeElement(selectedElement);
                //this.clearSearch();

                if (this.params.hideSelected) {
                    this.insertListItems(this.cache.getLast());

                } else {
                    const listItemElement = this.getListElementByItem(selectedItem);

                    if (this.isListElementSelected(listItemElement)) {
                        this.unsetListElementSelected(listItemElement);
                    }
                }

                if (!this.isOpen && this.params.openByRemove) {
                    this.open();
                }

                if (this.isOpen && this.params.closeByRemove) {
                    this.close();
                }
                // this.loadListItems(this.tmpl.searchInput.value);
                this.updateValue();
            })
            .catch(error => {
                console.log('E', error);
                this.setElementLoading(selectedElement, false);
            })

    }


    // Event handlers
    selectedItemClick(selectedItemElement: HTMLElement, isRemoveButton = false) {
        if (this.isDisabled) return;

    if ((selectedItemElement as any).data && !isRemoveButton) {
      this.dispatchCustomInputEvent('click:selected', selectedItemElement, (selectedItemElement as any).data, isRemoveButton);
    }

    if (this.params.multiple && this.params.removable && !isRemoveButton) return;

        if (this.params.multiple && !this.params.removable) {
            isRemoveButton = true;
        }

        this.deselectItem(selectedItemElement, isRemoveButton);

    // this.dispatchCustomInputEvent();
  }

    listItemClick(listItemElement: HTMLElement) {

        if (this.isDisabled || this.isElementDisabled(listItemElement)) return;
        // Element is selected already
        //if (this.params.multiple && intersection(this.selectedItems, [listItemElement.data], this.params.trackFieldGetter).length) return;

        // this.setNextActiveListElement();
        this.selectItem(listItemElement);

        this.dispatchCustomInputEvent('click:list', listItemElement);
    }

    inputFieldClick() {
        if (this.isDisabled) return;

        if (this.params.openByInputClick && (this.params.multiple || !this.selectedItems.length)) {
            this.open();
        }
    }

    searchChange(value: any) {
        this.closeList();
        this.updateDropdownListItems(value)
            .then(this.openList.bind(this))
    }

    searchKeydown(e: KeyboardEvent) {
        switch (e.key) {
            case 'ArrowUp':
                if (this.isOpen) {
                    this.setPreviousActiveListElement();
                } else {
                    this.open(); // Useful if openDropdownAbove mode
                }
                break;

            case 'ArrowDown':
                if (this.isOpen) {
                    this.setNextActiveListElement();
                } else {
                    this.open();
                }
                break;

            case 'ArrowLeft':
            case 'ArrowRight':
                break;

            case 'Tab':
                this.saveOn('tab');
                break;

            case 'Enter':
                this.saveOn('enter');
                // this.focus(); //Should be if keypress!
                e.preventDefault(); // Prevent the event from bubbling up as it might otherwise cause a form submission
                break;

            // case ' ':
            //     this.saveOn('space');
            //     break;

            case 'Escape':
                this.blur();

                break;

            case 'Backspace':
                if (!this.tmpl.searchInput.value) {
                    const lastSelectedElement = this.findLastChildElementWithData(this.tmpl.searchContainer);

                    this.deselectItem(lastSelectedElement);
                    break;
                }
            default: // any key
                if (this.params.multiple) {
                    this.setActiveSelectedElement();
                }
        }
    }

  dispatchCustomInputEvent(eventName: string, element?: HTMLElement, item?: any, isRemoveButton = false) {
    // FIXME
    // case: custom input lose focus after every action
    // if (this.focusBlurInstance.inputElement !== this.tmpl.searchInput) {
    //     setTimeout(() => {
    //         if (!this.isFocused) {
    //             console.log(2222);
    //             this.open();
    //             this.elem.dispatchEvent(new Event('click'));
    //         }
    //     }, 100)
    // }
    // setTimeout(() => {
    //   this.elem.dispatchEvent(new CustomEvent(eventName, {
    //     detail: {
    //       element: element,
    //       item: item,
    //       isRemoveButton: isRemoveButton
    //     },
    //     bubbles: true,
    //     cancelable: false
    //   }));
    // });
  }
}

export class SelectWeb extends Select {
    constructor(element: HTMLElement, params: any = {}) {
        if (params.localStyle !== false) {
            params.localStyle = (typeof params.localStyle === 'string') ? params.localStyle : String(style)
        }
        super(element, params);
    }
}