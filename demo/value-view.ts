import template from './value-view.html';
import {CodeArea} from './code-area'

export class ValueView extends CodeArea {
    constructor(containerElement: HTMLElement) {
        containerElement.innerHTML = String(template);

        const codeAreaElement: HTMLElement = containerElement.querySelector('.value-code-area')!;

        super(codeAreaElement);
    }
}