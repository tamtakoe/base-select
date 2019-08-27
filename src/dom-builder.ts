import template from './select.html';

import {
    intersection,
    ascSort,
    distributeOptionsByGroup,
    getElementContainer,
    findIndex,
    removeChildren,
    getItemsByField,
    deepReplace,
    bindFocusBlur,
    scrollActiveOption,
    updateElements,
    hasNoSpaceBelowForMenu,
    debounceEventValue,
    noopPipe,
    noop
} from './utils';

const CssClass = {
    select             : 'base-select',
    open               : 'open',
    multiple           : 'multiple',
    active             : 'active',
    focused            : 'focused',
    loading            : 'loading',
    removable          : 'removable',
    selected           : 'selected',
    readonly           : 'readonly',
    disabled           : 'disabled',
    limited            : 'limited',
    above              : 'above',
    hide               : 'hide',
    selectedItem       : 'select-search-list-item_selection',
    inputNote          : 'select-search-list-item_input-note',
    selectedItemRemove : 'close',
    listItem           : 'select-dropdown-list-optgroup-option',
};

const ADD_CLASS_METHOD_NAME = 'add';
const REMOVE_CLASS_METHOD_NAME = 'remove';

export abstract class SelectDom {
    paramsDefault: any = {
        multiple: false,
        readonly: false,
        placeholder: 'Select',
        multiplePlaceholder: 'Add', //''
        emptyDropdownLabel: 'Not found', //TODO make getters

        // Basic
        openByRemove: true,
        openByActiveRemove: true,
        openByInputClick: true,
        closeByRemove: true,
        closeBySelect: true,
        activeByOpen: true,

        // Complex
        keepOpened: false,
        removable: false,
        hideSelected: true,

        // Models
        value: undefined,
        items: [],

        getItems: (query?: any, selectedItemsForQuery?: any[]) => [],
        getItemsByValue: undefined, //(value?) => [],

        // Fields
        valueField: undefined,
        groupField: undefined,
        searchField: undefined, //Field for search and edit
        trackField: undefined,
        disabledField: undefined,
        dropdownItemLabelField: undefined,
        selectedItemLabelField: undefined,

        // Getters
        valueFieldGetter: noopPipe, //private
        searchFieldGetter: noopPipe,
        trackFieldGetter: noopPipe,
        disabledFieldGetter: noop,
        selectedItemLabelGetter: noopPipe,
        dropdownItemLabelGetter: noopPipe,
        groupLabelGetter: noopPipe,
        groupFieldGetter: (item) => '',
        customAreaGetter: noop,
        infoGetter: (hiddenItemsNumber) => '',

        // New item
        creatable: false, //{id: null, name: $query, category: 'shoes'}
        createItemFn: noopPipe, //addItem($query)
        removeItemFn: noopPipe, //removeItem($item)
        saveTrigger: 'enter blur space . , ;', //no space

        editable: true,
        editItemFn: noopPipe,

        // Misc
        multipleVisibleLimit: Infinity,
        multipleLimit: Infinity,
        multipleLimitBlinkDelay: 150,
        debounce: 200,
        useCache: true,
        rotateList: true,
        position: undefined,

        debug: false

        // oneLine
        // extraFilter
        // myGroupFilter +/-
        // validation
    };

    params: any = Object.assign({}, this.paramsDefault);
    // value;
    selectedItems = [];
    elem: any;
    tmpl: any = {};
    isOpen: boolean = false; // Dropdown is opened
    isFocused: boolean = false; // Input element is focused
    isLoading: boolean = false; // Some process (e.g. load items) is in progress
    isRemovable: boolean = false;
    isEmpty: boolean = false;
    isDisabled: boolean = false;
    isReadonly: boolean = false;
    isDropdownAbove: boolean = false;
    activeListElement;
    activeSelectedElement;

    unbindFocusBlur = noop;
    focusBlurInstance = null;

    // Handlers
    abstract searchChange(value): void;
    abstract searchKeydown(e): void;
    abstract selectedItemClick(element, isRemoveButton?): void;
    abstract listItemClick(element): void;
    abstract inputFieldClick(): void;

    constructor(element, style?) {
        let styleElement;

        // Include style to component dom (useful for web-component shadow dom)
        if (style) {
            styleElement = document.createElement('style');

            styleElement.innerHTML = String(style);
            element.before(styleElement);
        }

        const containerElement = document.createElement('div');

        containerElement.innerHTML = String(template);

        this.elem = element;

        // Get templates
        this.tmpl.searchContainer = containerElement.querySelector('.select-search-list');
        this.tmpl.searchPlaceholder = containerElement.querySelector('.select-search-placeholder');
        this.tmpl.selection = containerElement.querySelector('.select-search-list-item_selection');
        this.tmpl.selectionRemoveBtn = this.tmpl.selection.querySelector('.close');
        this.tmpl.searchInputInfo = containerElement.querySelector('.select-search-list-item_info');
        this.tmpl.searchInputItem = containerElement.querySelector('.select-search-list-item_input');
        this.tmpl.searchInputNote = this.tmpl.searchInputItem.querySelector('.select-search-list-item_input-note');
        this.tmpl.searchInput = this.tmpl.searchInputItem.querySelector('input');
        this.tmpl.searchLoader = containerElement.querySelector('.select-search-list-item_loader');

        this.tmpl.dropdownContainer = containerElement.querySelector('.select-dropdown-list');
        this.tmpl.dropdownCustomArea = containerElement.querySelector('.select-dropdown-custom');
        this.tmpl.dropdownEmpty = containerElement.querySelector('.select-dropdown-empty');
        this.tmpl.optionGroup = containerElement.querySelector('.select-dropdown-list-optgroup');
        this.tmpl.optionGroupHeader = containerElement.querySelector('.select-dropdown-list-optgroup-header');
        this.tmpl.option = containerElement.querySelector('.select-dropdown-list-optgroup-option');

        // Clean elements
        this.tmpl.selection.remove();
        this.tmpl.searchInputNote.remove();
        this.tmpl.optionGroupHeader.remove();
        this.tmpl.option.remove();
        this.tmpl.optionGroup.remove();

        this.elem.classList.add(CssClass.select);
        removeChildren(this.elem);

        // Set base template
        this.elem.prepend.apply(this.elem, containerElement.children);

        this.addListeners();
    }

    public bindInput(inputElement = this.tmpl.searchInput) {
        if (this.focusBlurInstance) {
            this.focusBlurInstance.unbind();
        }

        this.focusBlurInstance = bindFocusBlur(this.elem, inputElement);
    }

    // public bindInput(inputElement?) {
    //     this.unbindFocusBlur();
    //
    //     if (inputElement) {
    //         this.unbindFocusBlur = bindFocusBlur(this.elem, inputElement);
    //     }
    // }

    addListeners() {
        this.elem.addEventListener('focus', this.searchFocusHandler);
        this.elem.addEventListener('blur', this.searchBlurHandler);
        this.tmpl.searchInput.addEventListener('input', this.searchInputHandler);
        this.tmpl.searchInput.addEventListener('keydown', this.searchKeydownHandler);
        this.tmpl.searchInput.addEventListener('change', this.stopImmediatePropagation); // case: add element by Enter produce excess event
        this.tmpl.searchContainer.addEventListener('click', this.searchContainerClickHandler);
        this.tmpl.dropdownContainer.addEventListener('click', this.listItemClickHandler);
        this.tmpl.dropdownContainer.addEventListener('mousemove', this.listItemMousemoveHandler);

        // Implement focus/blur behaviour for the main select element according internal input element
        this.bindInput(this.tmpl.searchInput); // todo: bind other events
        // this.focusBlurInstance = bindFocusBlur(this.elem, this.tmpl.searchInput); // todo: bind other events
    }

    removeListeners() {
        this.elem.removeEventListener('focus', this.searchFocusHandler);
        this.elem.removeEventListener('blur', this.searchBlurHandler);
        this.tmpl.searchInput.removeEventListener('input', this.searchInputHandler);
        this.tmpl.searchInput.removeEventListener('keydown', this.searchKeydownHandler);
        this.tmpl.searchInput.removeEventListener('change', this.stopImmediatePropagation);
        this.tmpl.searchContainer.removeEventListener('click', this.searchContainerClickHandler);
        this.tmpl.dropdownContainer.removeEventListener('click', this.listItemClickHandler);
        this.tmpl.dropdownContainer.removeEventListener('mousemove', this.listItemMousemoveHandler);
        // this.bindInput();
        this.focusBlurInstance.unbind();
    }

    blinkRestriction() {
        this.elem.classList.add(CssClass.limited);

        setTimeout(() => {
            this.elem.classList.remove(CssClass.limited);
        }, this.params.multipleLimitBlinkDelay);
    }


    setDropdownAbove(isDropdownAbove: boolean) {
        this.elem.classList[isDropdownAbove ? ADD_CLASS_METHOD_NAME : REMOVE_CLASS_METHOD_NAME](CssClass.above);
        this.isDropdownAbove = isDropdownAbove;
    }

    setFocus(isFocus: boolean) {
        this.elem.classList[isFocus ? ADD_CLASS_METHOD_NAME : REMOVE_CLASS_METHOD_NAME](CssClass.focused);
        this.isFocused = isFocus;
    }

    setLoading(isLoading: boolean) {
        this.elem.classList[isLoading ? ADD_CLASS_METHOD_NAME : REMOVE_CLASS_METHOD_NAME](CssClass.loading);
        this.isLoading = isLoading;
    }

    setElementLoading(element, isLoading) {
        element.classList[isLoading ? ADD_CLASS_METHOD_NAME : REMOVE_CLASS_METHOD_NAME](CssClass.loading);
    }

    setRemovable(isRemovable: boolean) {
        this.elem.classList[isRemovable ? ADD_CLASS_METHOD_NAME : REMOVE_CLASS_METHOD_NAME](CssClass.removable);
        this.isRemovable = isRemovable;
    }

    setElementDisabled(element, isDisabled: boolean) {
        element.classList[isDisabled ? ADD_CLASS_METHOD_NAME : REMOVE_CLASS_METHOD_NAME](CssClass.disabled);
    }

    isElementDisabled(element) {
        return element.classList.contains(CssClass.disabled)
    }

    setDisabled(isDisabled: boolean) {
        if (isDisabled && !this.isDisabled) {
            this.elem.setAttribute(CssClass.disabled, 'disabled');
            this.tmpl.searchInput.setAttribute(CssClass.disabled, '');

        } else if (!isDisabled && this.isDisabled) {
            this.elem.removeAttribute(CssClass.disabled);
            this.tmpl.searchInput.removeAttribute(CssClass.disabled);
        }

        this.isDisabled = isDisabled;
    }

    setReadonly(isReadonly: boolean) {
        if (isReadonly && !this.isReadonly) {
            this.elem.setAttribute(CssClass.readonly, '');
            this.tmpl.searchInput.setAttribute(CssClass.readonly, '');

        } else if (!isReadonly && this.isReadonly) {
            this.elem.removeAttribute(CssClass.readonly);
            this.tmpl.searchInput.removeAttribute(CssClass.readonly);
        }

        this.isReadonly = isReadonly;
    }

    openList() {
        if (!this.isOpen) {
            if (!this.params.position) {
                this.setDropdownAbove(hasNoSpaceBelowForMenu(this.elem, this.tmpl.dropdownContainer));
            }
            this.isOpen = true;
            this.elem.classList.add(CssClass.open);

            if (this.params.activeByOpen) {
                this.setFirstActiveListElement(); // Show menu first because scroll works if menu is visible only
            }

            this.elem.dispatchEvent(new Event('open'));
        }
    }

    closeList() {
        if (this.isOpen) {
            this.isOpen = false;

            // Do this in timeout because list can be opened immediately after closing (case: searching)
            setTimeout(() => {
                if (!this.isOpen) {
                    this.elem.classList.remove(CssClass.open);
                    this.setActiveListElement();
                    this.elem.dispatchEvent(new Event('close'));
                }
            });
        }

    }

    updatePlaceholder() {
        const useMultiplePlaceholder = this.params.multiple && this.selectedItems.length;

        this.tmpl.searchInput.placeholder = (useMultiplePlaceholder ? this.params.multiplePlaceholder : this.params.placeholder) || '';
        this.tmpl.searchPlaceholder.innerHTML = this.params.placeholder || '';
        // this.setPlaceholder(this.params.multiple && this.selectedItems.length ? this.params.multiplePlaceholder : this.params.placeholder)
    }

    setPlaceholder(text = '') { //E.g. needs for custom edit functions
        this.tmpl.searchInput.placeholder = String(text);
    }

    setInputInfo(text = '') {
        this.tmpl.searchInputInfo.innerHTML = String(text);
    }

    updateInputInfo() {
        this.setInputInfo(this.params.infoGetter(this.selectedItems.length - this.params.multipleVisibleLimit))
    }

    setDropdownLabel(tmpl = '') {
        this.tmpl.dropdownEmpty.innerHTML = String(tmpl);
    }

    setEmpty(isEmpty: boolean) {
        this.tmpl.dropdownEmpty.classList[isEmpty ? 'remove' : 'add'](CssClass.hide);
        this.isEmpty = isEmpty;
    }

    setQuery(text = '', selectAll?: boolean) {
        const inputElement = this.focusBlurInstance.inputElement; //this.tmpl.searchInput;

        inputElement.value = String(text);

        if (selectAll && text && !this.isReadonly) {
            inputElement.setSelectionRange(0, text.length)
        }
    }

    getQuery() {
        // return this.tmpl.searchInput.value;
        return this.focusBlurInstance.inputElement.value;
    }

    isListElementSelected(element) {
        return element.classList.contains(CssClass.selected);
    }

    setListElementSelected(element) {
        if (!element.classList.contains(CssClass.selected)) {
            return element.classList.add(CssClass.selected) || true;
        }
    }

    unsetListElementSelected(element) {
        if (element.classList.contains(CssClass.selected)) {
            return element.classList.remove(CssClass.selected) || true;
        }
    }

    focus() {
        if (!this.isFocused && !this.isDisabled) {
            // this.tmpl.searchInput.dispatchEvent(new Event('focus'));
            // this.tmpl.searchInput.focus(); // doesn't work if input element have display:none
            this.focusBlurInstance.inputElement.focus(); // doesn't work if input element have display:none
        }
    }

    blur() {
        if (this.isFocused && !this.isDisabled) {
            // this.tmpl.searchInput.blur(); // doesn't work if input element have display:none
            this.focusBlurInstance.inputElement.blur(); // doesn't work if input element have display:none
        }
    }

    // Multiple/Single
    setMultiple(isMultiple: boolean) {
        this.elem.classList[isMultiple ? 'add' : 'remove'](CssClass.multiple);
    }


    getSelectedItemElementByItem(item) {
        const trackFieldGetter = this.params.trackFieldGetter;

        return Array.from(this.tmpl.searchContainer.children).find((element: any) => {
            return element.data && trackFieldGetter(element.data) === trackFieldGetter(item);
        })
    }

    getListElementByItem(item) {
        const trackFieldGetter = this.params.trackFieldGetter;
        const groupElements = this.tmpl.dropdownContainer.children;

        for (let i = 0; i < groupElements.length; i++) {
            if (this.isDataElement(groupElements[i])) {
                const itemElements = groupElements[i].children;

                for (let j = 0; j < itemElements.length; j++) {
                    if (itemElements[j].data && trackFieldGetter(itemElements[j].data) === trackFieldGetter(item)) {
                        return itemElements[j];
                    }
                }
            }
        }
    }

    // Element constructors
    updateLabel(element, labelGetter, item, query?, extraLabelElement?){
        const label = labelGetter(item, query);
        // console.log(item.name, isDisabled);

        if (typeof label === 'string' || typeof label === 'number') {
            extraLabelElement = extraLabelElement ? extraLabelElement.outerHTML : '';
            element.innerHTML = String(label) + extraLabelElement;

        } else if (label) {
            element.innerHTML = '';
            element.appendChild(label);

            if (extraLabelElement) {
                element.appendChild(extraLabelElement.cloneNode(true));
            }
        }

        // if (typeof item === 'object') { //Check for special data type
        //     element.data = item;
        // }

        return element;
    }

    createListItemsGroupElement(groupName) {
        const itemsGroupElement = this.tmpl.optionGroup.cloneNode();

        itemsGroupElement.data = groupName;

        // Add group header if non default group (group.name !== '')
        if (groupName) {
            const itemsGroupHeaderElement = this.tmpl.optionGroupHeader.cloneNode();

            // this.updateLabel(itemsGroupHeaderElement, this.params.groupLabelGetter, groupName);
            itemsGroupHeaderElement.innerHTML = this.params.groupLabelGetter(groupName);
            itemsGroupElement.appendChild(itemsGroupHeaderElement);
        }

        return itemsGroupElement;
    }

    createListItemElement(item) {
        const optionElement = this.tmpl.option.cloneNode();
        const isDisabled = this.params.disabledFieldGetter(item);

        this.updateLabel(optionElement, this.params.dropdownItemLabelGetter, item);
        optionElement.data = item;
        this.setElementDisabled(optionElement, isDisabled);

        return optionElement;
    }

    createSelectedItemElement(item) {
        const selectedElement = this.tmpl.selection.cloneNode();
        const selectedItemLabel = this.params.selectedItemLabelGetter(item);

        this.updateLabel(selectedElement, this.params.selectedItemLabelGetter, item, null, this.tmpl.selectionRemoveBtn);
        selectedElement.data = item;

        // if (typeof selectedItemLabel === 'string') {
        //   selectedElement.innerHTML = selectedItemLabel + this.tmpl.selectionRemoveBtn.outerHTML;
        //
        // } else {
        //   selectedElement.innerHTML = '';
        //   selectedElement.appendChild(selectedItemLabel);
        //   selectedElement.appendChild(this.tmpl.selectionRemoveBtn.cloneNode(true));
        // }
        //
        // selectedElement.data = item;

        return selectedElement;
    }


    postRenderSelectedElements() {
        if (this.params.multipleVisibleLimit === Infinity) {
            return;
        }

        //TODO make true multipleVisibleLimit logic. Without post rendering but with excluding element out of DOM
        const elementsArr: any[] = Array.from(this.tmpl.searchContainer.children).filter(element => element.hasOwnProperty('data'));

        for (let i = 0; i < elementsArr.length; i++) {
            if (i < this.params.multipleVisibleLimit) {
                elementsArr[i].classList.remove('hide');
            } else {
                elementsArr[i].classList.add('hide');
            }
        }
    }

    // DOM manipulations
    insertSelectedElements(items = []) {
        console.log(555, items);
        updateElements(this.tmpl.searchContainer, items, this.createSelectedItemElement.bind(this), this.params.trackFieldGetter, true);
        this.postRenderSelectedElements();
    }

    insertSelectedElement(item) {
        const itemElement = this.createSelectedItemElement(item);

        itemElement.data = item;
        this.tmpl.searchContainer.insertBefore(itemElement, this.tmpl.searchInputInfo);
        this.postRenderSelectedElements();
    }

    removeElement(element) {
        element.remove();
        this.postRenderSelectedElements(); //!!
    }

    insertListItems(items = [], query = '') {
        const selectedItems = this.selectedItems.slice();
        const trackFieldGetter = this.params.trackFieldGetter;

        if (this.params.hideSelected) {
            items = intersection(items, selectedItems, trackFieldGetter, true);
        }

        this.setEmpty(!items.length);

        const sortedList = ascSort(items, '', this.params.searchFieldGetter);
        const groups = distributeOptionsByGroup(sortedList, this.params.groupFieldGetter);
        const groupNames = Object.keys(groups).filter(key => groups[key].length).sort();
        const updatedGroupElements = updateElements(this.tmpl.dropdownContainer, groupNames, this.createListItemsGroupElement.bind(this));

        Array.from(updatedGroupElements.children).forEach((groupElement: any, i) => {
            if (groupElement.data !== undefined) {
                const items = groups[groupElement.data];
                const updatedItemElementsContainer = updateElements(groupElement, items, this.createListItemElement.bind(this), trackFieldGetter);

                // Post rendering for highlighting Todo: optimize it for deep elements
                Array.from(updatedItemElementsContainer.children).map((itemElement: any) => {
                    if (itemElement.data) {
                        this.updateLabel(itemElement, this.params.dropdownItemLabelGetter, itemElement.data, query);

                        if (!this.params.hideSelected) {
                            const isSelected = selectedItems.some(item => trackFieldGetter(itemElement.data) === trackFieldGetter(item));

                            isSelected ? this.setListElementSelected(itemElement) : this.unsetListElementSelected(itemElement);
                        }
                    }
                });
            }
        });

        return sortedList;
    }

    insertCustomArea() {
        const customAreaElement =  this.params.customAreaGetter.call(this);

        this.tmpl.dropdownCustomArea.innerHTML = '';

        if (customAreaElement) {
            this.tmpl.dropdownCustomArea.append(customAreaElement);
        }
    }

    // Selected items controller
    setActiveSelectedElement(element?) {
        if (this.activeSelectedElement) {
            this.activeSelectedElement.classList.remove(CssClass.active);
            this.activeSelectedElement = null;
        }

        if (element) {
            element.classList.add(CssClass.active);
            this.activeSelectedElement = element;
        }
    }

    // List elements controller
    setActiveListElement(element?) {
        // if (!element) return;
        if (this.activeListElement) {
            this.activeListElement.classList.remove(CssClass.active);
            this.activeListElement = null
        }

        if (element && this.isOpen) { //ActiveListElement can't exist if list is closed
            element.classList.add(CssClass.active);
            this.activeListElement = element;
            scrollActiveOption(this.tmpl.dropdownContainer, element);
        }

        // if (!keyUpDownWerePressed && scope.selectorPosition !== index) {
        //     setOption(listElement, index);
        // } else {
        //     keyUpDownWerePressed = false;
        // }
    }

    setFirstActiveListElement() {
        const firstListElement = this.isDropdownAbove ? this.getLastListElement() : this.getFirstListElement();

        this.setActiveListElement(firstListElement);
    }

    setNextActiveListElement(isPrevious?: boolean, parentNode?) {
        try {
            const activeElement = this.activeListElement;

            if (!activeElement) {
                return this.setActiveListElement((this.isDropdownAbove ? !isPrevious : isPrevious) ? this.getLastListElement() : this.getFirstListElement());
            }

            let nextElement = this.getSiblingElement(activeElement, isPrevious);

            //if (!nextElement) return;
            //debugger

            if (!this.isDataElement(nextElement)) {
                const nextGroup = this.getSiblingElement(activeElement.parentNode || parentNode, isPrevious);

                if (this.isDataElement(nextGroup)) {
                    nextElement = this.findFirstChildElementWithData(nextGroup, isPrevious);

                } else if (this.params.rotateList) {
                    nextElement = isPrevious ? this.getLastListElement() : this.getFirstListElement();
                }
            }

            if (this.isDataElement(nextElement)) {
                this.setActiveListElement(nextElement);
            } else {
                this.setActiveListElement(); //Need it for correct work
            }
        } catch (e) {
            this.setFirstActiveListElement()
        }

    }

    setPreviousActiveListElement() {
        this.setNextActiveListElement(true);
    }

    // getActiveListElement() {
    //     return this.activeListElement;
    // }

    getSiblingElement(element, isPrevious?: boolean) {
        const siblingFieldName = isPrevious ? 'previousSibling' : 'nextSibling';

        do  {
            element = element && element[siblingFieldName];

        } while (element && !this.isDataElement(element));

        return element;
    }

    getFirstListElement() {
        const firstGroup = this.findFirstChildElementWithData(this.tmpl.dropdownContainer);

        return this.findFirstChildElementWithData(firstGroup);
    }

    getLastListElement() {
        const lastGroup = this.findLastChildElementWithData(this.tmpl.dropdownContainer);

        return this.findLastChildElementWithData(lastGroup);
    }

    findFirstChildElementWithData(containerElement, invert?: boolean) {
        if (!containerElement) return;

        const total = containerElement.children.length;

        for (let f = 0, l = total - 1; f < total; f++, l--) {
            const i = invert ? l : f;
            const childElement = containerElement.children[i];

            if (this.isDataElement(childElement)) {
                return childElement;
            }
        }
    }

    findLastChildElementWithData(containerElement) {
        return this.findFirstChildElementWithData(containerElement, true);
    }

    isDataElement(element) {
        // Enabled element node with data
        return element && element.nodeType === 1 && element.data !== undefined && !this.isElementDisabled(element);
    }

    // Event handlers
    searchFocusHandler = () => {
        // console.log('+ searchFocusHandler');
        this.setFocus(true);
    };

    searchBlurHandler = () => {
        // console.log('+ searchBlurHandler');
        this.closeList();
        this.setActiveSelectedElement();
        this.insertListItems(); // Don't store list of items if component hasn't focus
        this.setFocus(false);
        this.setQuery(''); //maybe move it ti closeList
    };

    // searchInputHandler = (e) => {
    //     console.log(22222, e.target.value);
    //
    //     // this.params.debounce
    //     this.searchChange(e.target.value);
    // };

    searchInputHandler = debounceEventValue((value) => {
        this.searchChange(value);
    }, this.params.debounce);


    searchKeydownHandler = (e) => {
        this.searchKeydown(e);
    };

    searchContainerClickHandler = (e) => {
        //this.focus(); //Maybe don't need

        const selectedItemElement = getElementContainer(e.target, this.tmpl.dropdownContainer, CssClass.selectedItem);

        if (selectedItemElement) {
            const selectedItemRemoveElement = getElementContainer(e.target, selectedItemElement, CssClass.selectedItemRemove);

            this.selectedItemClick(selectedItemElement, !!selectedItemRemoveElement);

        } else {
            this.inputFieldClick();
        }
    };

    listItemClickHandler = (e) => {
        const listItemElement = getElementContainer(e.target, this.tmpl.dropdownContainer,  CssClass.listItem);

        if (listItemElement) {
            this.listItemClick(listItemElement);

            // Set next active element if dropdown still opened
            setTimeout(() => {
                if (!this.isOpen) return;

                const nextListItemElement = getElementContainer(document.elementFromPoint(e.pageX, e.pageY) as HTMLElement, this.tmpl.dropdownContainer, CssClass.listItem) || this.getFirstListElement();

                if (nextListItemElement) {
                    this.setActiveListElement(nextListItemElement);
                }
            })

        }
    };

    listItemMousemoveHandler = (e) => {
        const optionElement = getElementContainer(e.target, this.tmpl.dropdownContainer, CssClass.listItem);

        if (optionElement && optionElement !== this.activeListElement) {
            this.setActiveListElement(optionElement);
        }
    };

    stopImmediatePropagation = (e) => e.stopImmediatePropagation();
}
