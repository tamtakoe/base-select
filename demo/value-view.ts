import template from './value-view.html';
import {CodeArea} from './code-area'

export class ValueView extends CodeArea {
    constructor(containerElement) {
        containerElement.innerHTML = String(template);

        const codeAreaElement: any = containerElement.querySelector('.value-code-area');

        super(codeAreaElement);
    }
}