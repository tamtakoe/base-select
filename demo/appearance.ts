import template from './appearance.html';
import { NavGroup } from './nav-group';
import {RadioGroup} from './radio-group'
import { getUrlQueryValue } from './utils';

export class Appearance {
    constructor (containerElement: HTMLElement, selectElement: HTMLElement, setParams: (params: any) => void, setCssFramework: (cssFramework: string) => void) {
        containerElement.innerHTML = String(template);

        const useShadowDom = !!getUrlQueryValue('shadow-dom')
        const extraAppearanceContainerElement: HTMLElement = containerElement.querySelector('.extra-appearance-container')!;

        new NavGroup(containerElement.querySelector('.use-shadow-dom-nav')!, [{
            title: 'No',
            active: !useShadowDom,
            url: '?shadow-dom=false'
        }, {
            title: 'Yes',
            active: useShadowDom,
            url: '?shadow-dom=true'
        }])
        
        new RadioGroup(containerElement.querySelector('.dropdown-position-radio-group')!, [{
            label: 'Auto',
            value: false,
            checked: true
        }, {
            label: 'Top',
            value: 'top',
        }, {
            label: 'Bottom',
            value: 'bottom'
        }], (value: string) => {
            setParams({
                position: value
            });
        });

        new RadioGroup(containerElement.querySelector('.css-framework-radio-group')!, [{
            label: 'None',
            value: false,
            checked: true
        }, {
            label: 'Bootstrap 5',
            value: 'bootstrap',
        }, {
            label: 'Foundation 6',
            value: 'foundation'
        }, {
            label: 'Materialize 1',
            value: 'materialize'
        }], (value: string) => {
            switch (value) {
                case 'bootstrap': showSizeArea();
                    break;
                default: clearExtraAppearanceContainer();
            }
            setCssFramework(value);
        });

        function clearExtraAppearanceContainer() {
            extraAppearanceContainerElement.innerHTML = '';
        }

        function showSizeArea() {
            extraAppearanceContainerElement.innerHTML = '<div class="subtitle">Size</div><div></div>';

            new RadioGroup(extraAppearanceContainerElement.children[1] as HTMLElement, [{
                label: 'Small',
                value: 'sm'
            }, {
                label: 'Default',
                value: 'default',
                checked: true
            }, {
                label: 'Large',
                value: 'lg'
            }], (value: string) => {
                switch (value) {
                    case 'default' :
                        selectElement.classList.remove('base-select-sm', 'base-select-lg');
                        break;

                    case 'sm' :
                        selectElement.classList.remove('base-select-lg');
                        selectElement.classList.add('base-select-sm');
                        break;

                    case 'lg' :
                        selectElement.classList.remove('base-select-sm');
                        selectElement.classList.add('base-select-lg');
                        break;
                }
            });
        }

        // new RadioGroup(containerElement.querySelector('.select-size-radio-group'), [{
        //     label: 'Small',
        //     value: 'sm'
        // }, {
        //     label: 'Default',
        //     value: 'default',
        //     checked: true
        // }, {
        //     label: 'Large',
        //     value: 'lg'
        // }], (value) => {
        //     switch (value) {
        //         case 'default' :
        //             selectElement.classList.remove('base-select-sm', 'base-select-lg');
        //             break;
        //
        //         case 'sm' :
        //             selectElement.classList.remove('base-select-lg');
        //             selectElement.classList.add('base-select-sm');
        //             break;
        //
        //         case 'lg' :
        //             selectElement.classList.remove('base-select-sm');
        //             selectElement.classList.add('base-select-lg');
        //             break;
        //     }
        // });
    }
}