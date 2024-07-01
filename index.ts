import {LZString} from './demo/lz-string'
import {originalItems, JSONfn, getUrlQueryValue} from './demo/utils'
import {ItemsGenerator} from './demo/items-generator'
import {ValueGenerator} from './demo/value-generator'
import {Options} from './demo/options'
import {FieldsAndGetters} from './demo/fields-n-getters'
import {EditAndCreate} from './demo/edit-n-create'
import {Appearance} from './demo/appearance'
import {ValueView} from './demo/value-view'
import {SettingsView} from './demo/settings-view'
import { SelectWeb } from './src/select';
// import { Select } from './dist/select'

let loadedItems = originalItems;

class StyleLinks {
    links: HTMLLinkElement[] = []

    constructor(private documentRef: Document) {}

    add(fileName: string) {
        const link = document.createElement('link');
    
        link.href = fileName;
        link.rel = 'stylesheet';
        this.links.push(link)
        this.documentRef.head.appendChild(link);
    }

    clear() {
        this.links.forEach(link => link.remove())
    }
}
const documentRef = document as any
const styleBaseLinks = new StyleLinks(documentRef)
const styleFrameworkLinks = new StyleLinks(documentRef)



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

documentRef.addEventListener("DOMContentLoaded", (e: Event) => {
    const isShadowDomProvided = !!documentRef.createElement('DIV').attachShadow;
    const useShadowDom = !!getUrlQueryValue('shadow-dom');

    let selectElement: any = documentRef.getElementById('select');

    const extraStyleBeforeElement = documentRef.createElement('style');
    const extraStyleAfterElement = documentRef.createElement('style');

    if (useShadowDom && isShadowDomProvided) {
        const documentRefFragment = selectElement;
        selectElement = documentRef.createElement('div');
        const htmlElement = documentRef.createElement('html'); // We need html and body tags
        const bodyElement = documentRef.createElement('body'); // for correct local applying bootstrap.css and other css-frameworks.
        bodyElement.style.margin = '0';

        const documentRefFragmentRoot = documentRefFragment.attachShadow({mode: 'open'});
        bodyElement.appendChild(selectElement);
        htmlElement.appendChild(bodyElement);
        documentRefFragmentRoot.appendChild(htmlElement);

        selectElement.before(extraStyleBeforeElement);
        selectElement.after(extraStyleAfterElement);
    } else {
        styleBaseLinks.add('select-base.css')
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



    const select = new SelectWeb(selectElement, selectParams);

    selectElement.addEventListener('change', (e: any) => {
        console.log('V', e.value);
        updateValue(e.value);
    });


    // Create UI
    const valueView = new ValueView(documentRef.getElementById('value-view'));
    const settingsView = new SettingsView(documentRef.getElementById('settings-view'), select);

    new ItemsGenerator(
        documentRef.getElementById('items-generator'),
        originalItems,
        setParams,
        (items: any) => loadedItems = items
    );

    new ValueGenerator(
        documentRef.getElementById('value-generator'),
        setParams,
        () => selectParams.value || loadedItems,
        updateValue,
    );

    const optionsComponent = new Options(
        documentRef.getElementById('options'),
        setParams
    );

    const fieldsAndGettersComponent = new FieldsAndGetters(
        documentRef.getElementById('fields-n-getters'),
        setParams,
        // {
        //     valueFieldInput: 'id',
        //     groupLabelFieldInput: 'category',
        //     selectionLabelFieldInput: 'name',
        //     itemLabelFieldInput: 'name'
        // }
    );

    const editAndCreateComponent = new EditAndCreate(
        documentRef.getElementById('edit-n-create'),
        setParams
    );

    new Appearance(
        documentRef.getElementById('appearance'),
        selectElement,
        setParams,
        setCssFramework
    );

    function updateUI(params1: any, isFirstUpdate = false) {
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

    function updateValue(value: any) {
        valueView.setCode(JSON.stringify(value, null, 2));
    }

    function setParams(params: any) {
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

    function setCssFramework(cssFrameworkKey: string) {
        styleFrameworkLinks.clear()
        switch (cssFrameworkKey) {
            case 'bootstrap' :
                styleFrameworkLinks.add('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css')
                styleFrameworkLinks.add('select-bootstrap.css')
                break;
            case 'foundation' :
                styleFrameworkLinks.add('https://cdn.jsdelivr.net/npm/foundation-sites@6.8.1/dist/css/foundation.min.css')
                break;
            case 'materialize' :
                styleFrameworkLinks.add('https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css')
                styleFrameworkLinks.add('select-material.css')
                break;
            default:
                break;
        }
    }
});

class UrlParamsStore {
    params;

    constructor(defaultParams: any) {
        let urlParams: any;
        (window.onpopstate = () => {
            let match: any,
                pl     = /\+/g,  // Regex for replacing addition symbol with a space
                search = /([^&=]+)=?([^&]*)/g,
                decode = function (s: string) { return decodeURIComponent(s.replace(pl, " ")); },
                query  = window.location.search.substring(1);

            urlParams = {};
            while (match = search.exec(query))
                urlParams[decode(match[1])] = decode(match[2]);
        })();
        this.params = JSONfn.parse(LZString.decompressFromEncodedURIComponent(urlParams.o) || '') || defaultParams;
    }

    patch(params: any) {
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
