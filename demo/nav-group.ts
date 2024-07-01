import template from './nav-group.html';
import {randomId, hashFnv32a, noop} from './utils';

interface NavOptions {
    title: string,
    active?: boolean
    url?: string,
}

const documentRef = typeof document !== 'undefined' ? document : null

export class NavGroup {
    name: string;
    navElements: HTMLElement[] = [];

    constructor (containerElement: HTMLElement, options: NavOptions[], callback: Function = noop) {
        this.name = randomId();
        containerElement.innerHTML = String(template);

        const customizableNavFormElement: any = containerElement.querySelector('.customizable-nav-form');
        const delimiterElement = documentRef.createTextNode(' | ');

        this.navElements = options.map(option => this.createNavElement(option));

        const allElements = this.navElements.reduce((acc, curr, index, arr) => {
            acc.push(curr);
            if (index < arr.length - 1) {
                acc.push(delimiterElement)
            }
            return acc
        }, [])

        allElements.forEach(element => customizableNavFormElement.appendChild(element))
    }

    createNavElement(opt: NavOptions) {
        const navHtml =  opt.active ? `<b>${opt.title}</b>` : `<a href="${opt.url}">${opt.title}</a>`;
        const containerFragment = documentRef.createElement('div');

        containerFragment.innerHTML = navHtml;

        return containerFragment.firstChild as HTMLElement;
    }
}