export declare class FnStorage {
    elems: any;
    storage: any;
    radioGroups: any;
    constructor(containerElement: any, options?: any, callback?: Function);
    createGroup(groupName: any, options: any, callback: any): void;
    show(name: string): void;
    hide(name: string): void;
    hideAll(): void;
    set(params: any): void;
}
