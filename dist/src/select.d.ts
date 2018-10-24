import { SelectDom } from './dom-builder';
export declare class Select extends SelectDom {
    value: any;
    private cache;
    loadItemsPromise: Promise<any>;
    constructor(element: any, params?: any);
    setParams(params?: any, emitEvent?: boolean): void;
    open(): void;
    close(): void;
    loadListItems(query?: any): Promise<any>;
    updateDropdownListItems(query?: any): Promise<void>;
    saveOn(key: any): void;
    updateValue(): void;
    dispatchValue(): void;
    selectItems(items: any): Promise<void>;
    selectItem(listItemElement: any, isNewItem?: boolean): void;
    deselectItem(selectedElement: any, isRemoveButton?: any): void;
    deselectAllItems(): void;
    updateSelectedElementList(items?: any[]): void;
    addToSelectedElementList(item: any): void;
    removeSelectedItem(selectedElement: any): void;
    selectedItemClick(selectedItemElement: any, isRemoveButton: any): void;
    listItemClick(listItemElement: any): void;
    inputFieldClick(): void;
    searchChange(value: any): void;
    searchKeydown(e: any): void;
    dispatchCustomInputEvent(eventName: any, element?: any, item?: any, isRemoveButton?: any): void;
}
