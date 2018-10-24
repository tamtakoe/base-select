import { CodeArea } from './code-area';
export declare class SettingsView extends CodeArea {
    isLast: boolean;
    select: any;
    log: any[];
    constructor(containerElement: any, select: any);
    update(params: any): void;
    showLog(): void;
    showAllSettings(): void;
    makeBeautiful(params: any, space?: number): string;
}
