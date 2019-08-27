import {LZString} from './demo/lz-string'
import {originalItems, JSONfn} from './demo/utils'
import {ItemsGenerator} from './demo/items-generator'
import {ValueGenerator} from './demo/value-generator'
import {Options} from './demo/options'
import {FieldsAndGetters} from './demo/fields-n-getters'
import {EditAndCreate} from './demo/edit-n-create'
import {Appearance} from './demo/appearance'
import {ValueView} from './demo/value-view'
import {SettingsView} from './demo/settings-view'

import * as bootstrapCss from './node_modules/bootstrap/dist/css/bootstrap.css';
import * as foundationCss from './node_modules/foundation-sites/dist/css/foundation.css';
import * as materialCss from './node_modules/materialize-css/dist/css/materialize.css';


import * as selectMaterialCss from './src/select-material.scss';
import * as selectBootstrapCss from './src/select-bootstrap.scss';

let loadedItems = originalItems;
// const useShadowDom = false;//true;

import { Select } from './src/select';

/* TODO
- make styles for other frameworks (fix native and bootstrap styles)
- implement correct style loading for no-shadow-dom case
- make correct build
- fix custom input case
- fix dropdown blink
- update date in the open dropdown
- fix editable bug (edit mode works only if you rechoose this mode)
- set custom keys
 */


document.addEventListener("DOMContentLoaded", (e) => {
    const isShadowDomProvided = !!document.createElement('DIV').attachShadow;
    const useShadowDom = !document.querySelector('[content="noShadowDom"]');

    let selectElement: any = document.getElementById('select');

    const extraStyleBeforeElement = document.createElement('style');
    const extraStyleAfterElement = document.createElement('style');

    if (useShadowDom && isShadowDomProvided) {
        const documentFragment = selectElement;
        selectElement = document.createElement('div');
        const htmlElement = document.createElement('html'); // We need html and body tags
        const bodyElement = document.createElement('body'); // for correct local applying bootstrap.css and other css-frameworks.
        bodyElement.style.margin = '0';

        const documentFragmentRoot = documentFragment.attachShadow({mode: 'open'});
        bodyElement.appendChild(selectElement);
        htmlElement.appendChild(bodyElement);
        documentFragmentRoot.appendChild(htmlElement);

        selectElement.before(extraStyleBeforeElement);
        selectElement.after(extraStyleAfterElement);
    }

    const defaultParams: any = {
        value: [{
            "id": 6,
            "name": "jacket",
            "category": "clothes"
        }],
        multiple: true,
        items: originalItems,
        groupField: 'category',
        trackField: 'id',
        searchField: 'name',
        disabledField: 'disabled',
        // editable: true,
        creatable: {id: 123, name: '$query', category: 'shoes'},

        // Make sense if you use select as web-component
        localStyle: useShadowDom
    };

    const urlParamsStore = new UrlParamsStore(defaultParams);

    const selectParams = urlParamsStore.get();


    let isLoaded = false;
    setTimeout(() => {
        isLoaded = true;
    }, 500);


    // const selectParams = JSONfn.parse(LZString.decompressFromEncodedURIComponent(urlParams.o) || null) || defaultParams;
    // //TODO remove items from url?
    //
    //
    // // console.log(selectParams.searchField, selectParams);
    // paramsStore.set(selectParams)
    // // const selectParams = JSONfn.parse(urlParams.o || '{}');
    // // const selectParams = JSON.parse(urlParams.o || '{}');



    const select = new Select(selectElement, selectParams);

    selectElement.addEventListener('change', (e: any) => {
        console.log('V', e.value);
        updateValue(e.value);
    });


    // Create UI
    const valueView = new ValueView(document.getElementById('value-view'));
    const settingsView = new SettingsView(document.getElementById('settings-view'), select);

    new ItemsGenerator(
        document.getElementById('items-generator'),
        originalItems,
        setParams,
        (items) => loadedItems = items
    );

    new ValueGenerator(
        document.getElementById('value-generator'),
        setParams,
        () => selectParams.value || loadedItems,
        updateValue,
    );

    const optionsComponent = new Options(
        document.getElementById('options'),
        setParams
    );

    const fieldsAndGettersComponent = new FieldsAndGetters(
        document.getElementById('fields-n-getters'),
        setParams,
        // {
        //     valueFieldInput: 'id',
        //     groupLabelFieldInput: 'category',
        //     selectionLabelFieldInput: 'name',
        //     itemLabelFieldInput: 'name'
        // }
    );

    const editAndCreateComponent = new EditAndCreate(
        document.getElementById('edit-n-create'),
        setParams
    );

    new Appearance(
        document.getElementById('appearance'),
        selectElement,
        setParams,
        setCssFramework
    );

    function updateUI(params1, isFirstUpdate?) {
        const params = urlParamsStore.get()
        // params = paramsMask.removeDefaults(params);
        //console.log('U', params);
        // debugger
        // const params = urlParamsStore.get()
        // params
        optionsComponent && optionsComponent.set(select.params);
        // editAndCreateComponent && editAndCreateComponent.set(select.params)
        editAndCreateComponent && editAndCreateComponent.set(Object.assign({}, select.params, {editItemFn: params.editItemFn, createItemFn: params.createItemFn, removeItemFn: params.removeItemFn}), isFirstUpdate)

        // optionsComponent && optionsComponent.set(urlParamsStore.get());
        if (isFirstUpdate) {
            // editAndCreateComponent && editAndCreateComponent.set(Object.assign({}, select.params, {editItemFn: params.editItemFn, createItemFn: params.createItemFn, removeItemFn: params.removeItemFn}))

            fieldsAndGettersComponent && fieldsAndGettersComponent.set(urlParamsStore.get());
        }
    }

    //Set defaults
    updateUI(selectParams, true);


    updateValue(selectParams.value);

    function updateValue(value) {
        valueView.setCode(JSON.stringify(value, null, 2));
    }

    function setParams(params) {
        if (isLoaded) {
            select.setParams(params);
            settingsView.update(params);
            // paramsMask.set(params); //Optimize
            //
            updateUI(select.params);
            console.log('+', urlParamsStore.get());

            urlParamsStore.patch(params);
        }
    }

    function setCssFramework(cssFrameworkKey) {
        switch (cssFrameworkKey) {
            case 'bootstrap' :
                extraStyleBeforeElement.innerHTML = String(bootstrapCss);
                extraStyleAfterElement.innerHTML = String(selectBootstrapCss);
                break;

            case 'foundation' :
                extraStyleBeforeElement.innerHTML = String(foundationCss);
                extraStyleAfterElement.innerHTML = '';
                break;

            case 'materialize' :
                extraStyleBeforeElement.innerHTML = String(materialCss);
                extraStyleAfterElement.innerHTML = String(selectMaterialCss);
                break;
            default:
                extraStyleBeforeElement.innerHTML = '';
                extraStyleAfterElement.innerHTML = '';
        }
    }
});

class UrlParamsStore {
    params;

    constructor(defaultParams) {
        let urlParams;
        (window.onpopstate = () => {
            let match,
                pl     = /\+/g,  // Regex for replacing addition symbol with a space
                search = /([^&=]+)=?([^&]*)/g,
                decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
                query  = window.location.search.substring(1);

            urlParams = {};
            while (match = search.exec(query))
                urlParams[decode(match[1])] = decode(match[2]);
        })();
        this.params = JSONfn.parse(LZString.decompressFromEncodedURIComponent(urlParams.o) || null) || defaultParams;
    }

    patch(params) {
        this.params = Object.assign(this.params || {}, params);
        // debugger
        // const a = JSONfn

        const paramsHash = LZString.compressToEncodedURIComponent(JSONfn.stringify(this.params));
        // const paramsHash = JSONfn.stringify(select.params);
        // const paramsHash = JSON.stringify(select.params);
        window.history.pushState('data',"title", '?o=' + paramsHash);
    }

    get() {
        return this.params;
    }
}
