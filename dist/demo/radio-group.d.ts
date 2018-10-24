interface RadioOptions {
    checked?: boolean;
    label?: string;
    value?: any;
}
export declare class RadioGroup {
    name: string;
    valueMap: any;
    value: any;
    radioElements: any[];
    constructor(containerElement: any, options: RadioOptions[], callback?: Function);
    createRadioElement(opt?: RadioOptions): Node;
    setValue(value: any): void;
}
export {};
