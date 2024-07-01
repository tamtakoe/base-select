import { SelectDom } from './dom-builder';
export declare class Select extends SelectDom {
    value: any;
    private cache;
    loadItemsPromise: Promise<any>;
    constructor(element: HTMLElement, params?: any);
    setParams(params?: any, emitEvent?: boolean): void;
    open(): void;
    close(): void;
    loadListItems(query?: any): Promise<any>;
    updateDropdownListItems(query?: string): Promise<void>;
    saveOn(key: string): void;
    updateValue(): void;
    dispatchValue(): void;
    selectItems(items: any[]): Promise<void>;
    selectItem(listItemElement: HTMLElement, isNewItem?: boolean): void;
    deselectItem(selectedElement: HTMLElement, isRemoveButton?: boolean): void;
    deselectAllItems(): void;
    updateSelectedElementList(items?: any[]): void;
    addToSelectedElementList(item: any): void;
    removeSelectedItem(selectedElement: HTMLElement): void;
    selectedItemClick(selectedItemElement: HTMLElement, isRemoveButton?: boolean): void;
    listItemClick(listItemElement: HTMLElement): void;
    inputFieldClick(): void;
    searchChange(value: any): void;
    searchKeydown(e: KeyboardEvent): void;
    dispatchCustomInputEvent(eventName: string, element?: HTMLElement, item?: any, isRemoveButton?: boolean): void;
}
export declare class SelectWeb extends Select {
    constructor(element: HTMLElement, params?: any);
}
