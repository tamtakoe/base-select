import template from './appearance.html';
import {RadioGroup} from './radio-group'

export class Appearance {
    constructor (containerElement, selectElement, setParams, setCssFramework) {
        containerElement.innerHTML = String(template);

        const extraAppearanceContainerElement = containerElement.querySelector('.extra-appearance-container');

        const rg = new RadioGroup(containerElement.querySelector('.dropdown-position-radio-group'), [{
            label: 'Auto',
            value: false,
            checked: true
        }, {
            label: 'Top',
            value: 'top',
        }, {
            label: 'Bottom',
            value: 'bottom'
        }], (value) => {
            setParams({
                position: value
            });
        });

        new RadioGroup(containerElement.querySelector('.css-framework-radio-group'), [{
            label: 'None',
            value: false,
            checked: true
        }, {
            label: 'Bootstrap 4',
            value: 'bootstrap',
        }, {
            label: 'Foundation 6',
            value: 'foundation'
        }, {
            label: 'Materialize 0.100',
            value: 'materialize'
        }], (value) => {
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

            new RadioGroup(extraAppearanceContainerElement.children[1], [{
                label: 'Small',
                value: 'sm'
            }, {
                label: 'Default',
                value: 'default',
                checked: true
            }, {
                label: 'Large',
                value: 'lg'
            }], (value) => {
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