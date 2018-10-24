export declare class CodeArea {
    elems: any;
    isEditMode: boolean;
    options: any;
    constructor(containerElement: any, options?: {
        isJson?: boolean;
        isFn?: boolean;
        hasSaveBtn?: boolean;
        successCallback?: Function;
        errorCallback?: Function;
    });
    getValidValue(): any;
    setCode(code?: string): void;
    editMode(isEditMode: boolean, initialValue?: string): void;
}
