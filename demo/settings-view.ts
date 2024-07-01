import template from './settings-view.html';
import {CodeArea} from './code-area'
import {RadioGroup} from './radio-group'
import {fnToStr, hashFnv32a} from './utils'

export class SettingsView extends CodeArea {
    isLast: boolean = false;
    select;
    log: string[] = [];

    constructor(containerElement: HTMLElement, select: any) {
        super(containerElement); // "A 'super' call must be the first statement in the constructor" hack

        this.select = select;
        containerElement.innerHTML = String(template);

        const codeAreaElement: HTMLElement = containerElement.querySelector('.settings-view-toggle')!;

        super(codeAreaElement);

        new RadioGroup(containerElement.querySelector('.settings-code-area')!, [{
            label: 'Last',
            value: 'last',
            checked: true
        }, {
            label: 'All',
            value: 'all'
        }], (value: string) => {
            this.isLast = false;

            switch (value) {
                case 'last' :
                    this.showLog();
                    this.isLast = true;
                    break;

                case 'all' :
                    this.showAllSettings();
                    break;
            }
        });
    }

    update(params: any) {
        if (this.isLast) {
            this.log.unshift(this.makeBeautiful(params));
            this.showLog();
        } else {
            this.showAllSettings();
        }
    }

    showLog() {
        this.setCode(this.log.join('\n\n--------------------------------------------------\n'));
    }

    showAllSettings() {
        this.setCode(this.makeBeautiful(this.select.params));
    }

    makeBeautiful(params: any, space = 2) {
        const spaceStr = '          ';
        const fnsHash: any = {};
        const readableSelectParams: any = Object.assign({}, params);

        for (let key in readableSelectParams) {
            if (readableSelectParams.hasOwnProperty(key)) {
                const value = readableSelectParams[key];

                if (typeof value === 'function') {
                    const fnStr = fnToStr(value, 2);
                    const fnHash = '$H{' + hashFnv32a(fnStr, true) + '}';

                    fnsHash[fnHash] = fnStr;
                    readableSelectParams[key] = fnHash;
                }

                if (key === 'items') {
                    readableSelectParams[key] = `[item x ${readableSelectParams.items && readableSelectParams.items.length}]`
                }

                if (value === undefined) {
                    readableSelectParams[key] = 'undefined'
                }
            }
        }

        const jsonStr = JSON.stringify(readableSelectParams, null, space);

        return jsonStr.replace(/\$H\{[0-9a-z]{8}\}/g, (value) => {
            return fnsHash[value].replace(/^/gm, spaceStr.slice(0, space)).replace(/^\s+/, '');
        }).replace('"undefined"', 'undefined');
    }
}