import template from './options.html';
import {setEnabledDisabled, updateCheckboxInput} from './utils';

export class Options{
    elems: any = {};

    constructor(containerElement: HTMLElement, setParams: any, lastValues: any = {}) {
        containerElement.innerHTML = String(template);

        this.elems.multipleCheckboxElement             = containerElement.querySelector('#multipleCheckbox');
        this.elems.hideSelectedCheckboxElement         = containerElement.querySelector('#hideSelectedCheckbox');
        this.elems.keepOpenedCheckboxElement           = containerElement.querySelector('#keepOpenedCheckbox');
        this.elems.useCacheCheckboxElement             = containerElement.querySelector('#useCacheCheckbox');
        this.elems.readonlyCheckboxElement             = containerElement.querySelector('#readonlyCheckbox');
        this.elems.disabledCheckboxElement             = containerElement.querySelector('#disabledCheckbox');
        this.elems.rotateListCheckboxElement           = containerElement.querySelector('#rotateListCheckbox');

        this.elems.openByRemoveCheckboxElement         = containerElement.querySelector('#openByRemoveCheckbox');
        this.elems.openByActiveRemoveCheckboxElement   = containerElement.querySelector('#openByActiveRemoveCheckbox');
        this.elems.openByInputClickCheckboxElement     = containerElement.querySelector('#openByInputClickCheckbox');
        this.elems.closeByRemoveCheckboxElement        = containerElement.querySelector('#closeByRemoveCheckbox');
        this.elems.closeBySelectCheckboxElement        = containerElement.querySelector('#closeBySelectCheckbox');
        this.elems.activeByOpenCheckboxElement         = containerElement.querySelector('#activeByOpenCheckbox');

        this.elems.placeholderInputElement             = containerElement.querySelector('#placeholderInput');
        this.elems.multiplePlaceholderInputElement     = containerElement.querySelector('#multiplePlaceholderInput');
        this.elems.emptyDropdownLabelInputElement      = containerElement.querySelector('#emptyDropdownLabelInput');
        this.elems.multipleLimitInputElement           = containerElement.querySelector('#multipleLimitInput');
        this.elems.multipleVisibleLimitInputElement    = containerElement.querySelector('#multipleVisibleLimitInput');
        this.elems.debounceInputElement                = containerElement.querySelector('#debounceInput');

        this.elems.placeholderCheckboxElement          = containerElement.querySelector('#placeholderCheckbox');
        this.elems.multiplePlaceholderCheckboxElement  = containerElement.querySelector('#multiplePlaceholderCheckbox');
        this.elems.emptyDropdownLabelCheckboxElement   = containerElement.querySelector('#emptyDropdownLabelCheckbox');
        this.elems.multipleLimitCheckboxElement        = containerElement.querySelector('#multipleLimitCheckbox');
        this.elems.multipleVisibleLimitCheckboxElement = containerElement.querySelector('#multipleVisibleLimitCheckbox');
        this.elems.debounceCheckboxElement             = containerElement.querySelector('#debounceCheckbox');

        // Main
        this.elems.multipleCheckboxElement.addEventListener('change', (e: any) => {
            setParams({
                multiple: e.target.checked
            })
        });

        this.elems.hideSelectedCheckboxElement.addEventListener('change', (e: any) => {
            setParams({
                hideSelected: e.target.checked
            })
        });

        this.elems.keepOpenedCheckboxElement.addEventListener('change', (e: any) => {
            setParams({
                keepOpened: e.target.checked
            })
        });

        this.elems.readonlyCheckboxElement.addEventListener('change', (e: any) => {
            setParams({
                readonly: e.target.checked
            })
        });

        this.elems.disabledCheckboxElement.addEventListener('change', (e: any) => {
            setParams({
                disabled: e.target.checked
            })
        });

        this.elems.rotateListCheckboxElement.addEventListener('change', (e: any) => {
            setParams({
                rotateList: e.target.checked
            })
        });


        // Basic
        this.elems.openByRemoveCheckboxElement.addEventListener('change', (e: any) => {
            setParams({
                openByRemove: e.target.checked
            })
        });

        this.elems.openByActiveRemoveCheckboxElement.addEventListener('change', (e: any) => {
            setParams({
                openByActiveRemove: e.target.checked
            })
        });

        this.elems.openByInputClickCheckboxElement.addEventListener('change', (e: any) => {
            setParams({
                openByInputClick: e.target.checked
            })
        });

        this.elems.closeByRemoveCheckboxElement.addEventListener('change', (e: any) => {
            setParams({
                closeByRemove: e.target.checked
            })
        });

        this.elems.closeBySelectCheckboxElement.addEventListener('change', (e: any) => {
            setParams({
                closeBySelect: e.target.checked
            })
        });

        this.elems.activeByOpenCheckboxElement.addEventListener('change', (e: any) => {
            setParams({
                activeByOpen: e.target.checked
            })
        });

        this.elems.useCacheCheckboxElement.addEventListener('change', (e: any) => {
            setParams({
                useCache: e.target.checked
            })
        });

        // Misc
        this.elems.placeholderCheckboxElement.addEventListener('change', (e: any) => {
            setEnabledDisabled(this.elems.placeholderInputElement, e.target.checked, lastValues);
            updateCheckboxInput('placeholder', this.elems.placeholderCheckboxElement, this.elems.placeholderInputElement, setParams);
        });

        this.elems.multiplePlaceholderCheckboxElement.addEventListener('change', (e: any) => {
            setEnabledDisabled(this.elems.multiplePlaceholderInputElement, e.target.checked, lastValues);
            updateCheckboxInput('multiplePlaceholder', this.elems.multiplePlaceholderCheckboxElement, this.elems.multiplePlaceholderInputElement, setParams);
        });

        this.elems.emptyDropdownLabelCheckboxElement.addEventListener('change', (e: any) => {
            setEnabledDisabled(this.elems.emptyDropdownLabelInputElement, e.target.checked, lastValues);
            updateCheckboxInput('emptyDropdownLabel', this.elems.emptyDropdownLabelCheckboxElement, this.elems.emptyDropdownLabelInputElement, setParams);
        });

        this.elems.multipleLimitCheckboxElement.addEventListener('change', (e: any) => {
            setEnabledDisabled(this.elems.multipleLimitInputElement, e.target.checked, lastValues, true);
            updateCheckboxInput('multipleLimit', this.elems.multipleLimitCheckboxElement, this.elems.multipleLimitInputElement, setParams);
        });

        this.elems.multipleVisibleLimitCheckboxElement.addEventListener('change', (e: any) => {
            setEnabledDisabled(this.elems.multipleVisibleLimitInputElement, e.target.checked, lastValues, true);
            updateCheckboxInput('multipleVisibleLimit', this.elems.multipleVisibleLimitCheckboxElement, this.elems.multipleVisibleLimitInputElement, setParams);
        });

        this.elems.debounceCheckboxElement.addEventListener('change', (e: any) => {
            setEnabledDisabled(this.elems.debounceInputElement, e.target.checked, lastValues, true);
            updateCheckboxInput('debounce', this.elems.debounceCheckboxElement, this.elems.debounceInputElement, setParams);
        });


        this.elems.placeholderInputElement.addEventListener('input', (e: any) => {
            updateCheckboxInput('placeholder', this.elems.placeholderCheckboxElement, this.elems.placeholderInputElement, setParams);
        });

        this.elems.multiplePlaceholderInputElement.addEventListener('input', (e: any) => {
            updateCheckboxInput('multiplePlaceholder', this.elems.multiplePlaceholderCheckboxElement, this.elems.multiplePlaceholderInputElement, setParams);
        });

        this.elems.emptyDropdownLabelInputElement.addEventListener('input', (e: any) => {
            updateCheckboxInput('emptyDropdownLabel', this.elems.emptyDropdownLabelCheckboxElement, this.elems.emptyDropdownLabelInputElement, setParams);
        });

        this.elems.multipleLimitInputElement.addEventListener('input', (e: any) => {
            updateCheckboxInput('multipleLimit', this.elems.multipleLimitCheckboxElement, this.elems.multipleLimitInputElement, setParams, true);
        });

        this.elems.multipleVisibleLimitInputElement.addEventListener('input', (e: any) => {
            updateCheckboxInput('multipleVisibleLimit', this.elems.multipleVisibleLimitCheckboxElement, this.elems.multipleVisibleLimitInputElement, setParams, true);
        });

        this.elems.debounceInputElement.addEventListener('input', (e: any) => {
            updateCheckboxInput('debounce', this.elems.debounceCheckboxElement, this.elems.debounceInputElement, setParams);
        });
    }

    set(params: any) {
        this.elems.multipleCheckboxElement.checked             = params.multiple;
        this.elems.hideSelectedCheckboxElement.checked         = params.hideSelected;
        this.elems.keepOpenedCheckboxElement.checked           = params.keepOpened;
        this.elems.readonlyCheckboxElement.checked             = params.readonly;
        this.elems.disabledCheckboxElement.checked             = params.disabled;
        this.elems.rotateListCheckboxElement.checked           = params.rotateList;

        this.elems.openByRemoveCheckboxElement.checked         = params.openByRemove;
        this.elems.openByActiveRemoveCheckboxElement.checked   = params.openByActiveRemove;
        this.elems.openByInputClickCheckboxElement.checked     = params.openByInputClick;
        this.elems.closeByRemoveCheckboxElement.checked        = params.closeByRemove;
        this.elems.closeBySelectCheckboxElement.checked        = params.closeBySelect;
        this.elems.activeByOpenCheckboxElement.checked         = params.activeByOpen;
        this.elems.useCacheCheckboxElement.checked             = params.useCache;

        this.elems.placeholderInputElement.value               = params.placeholder;
        this.elems.multiplePlaceholderInputElement.value       = params.multiplePlaceholder;
        this.elems.emptyDropdownLabelInputElement.value        = params.emptyDropdownLabel;
        this.elems.multipleLimitInputElement.value             = params.multipleLimit;
        this.elems.multipleVisibleLimitInputElement.value      = params.multipleVisibleLimit;
        this.elems.debounceInputElement.value                  = params.debounce;

        // this.elems.placeholderCheckboxElement.checked          = params.placeholder === 'Select';
        // this.elems.multiplePlaceholderCheckboxElement.checked  = params.multiplePlaceholder === 'Add';
        // this.elems.emptyDropdownLabelCheckboxElement.checked   = params.emptyDropdownLabel === 'Not found';
        // this.elems.multipleLimitCheckboxElement.checked        = !!params.multipleLimit;
        // this.elems.multipleVisibleLimitCheckboxElement.checked = !!params.multipleVisibleLimit;
        // this.elems.debounceCheckboxElement.checked             = params.debounce == 200;
        //
        // setEnabledDisabled(this.elems.placeholderInputElement, this.elems.placeholderCheckboxElement.checked, {placeholderInput: params.placeholder});
        // setEnabledDisabled(this.elems.multiplePlaceholderInputElement, this.elems.placeholderCheckboxElement.checked, {multiplePlaceholderInput: params.multiplePlaceholder});
        // setEnabledDisabled(this.elems.emptyDropdownLabelInputElement, this.elems.placeholderCheckboxElement.checked, {emptyDropdownLabelInput: params.emptyDropdownLabel});
        // setEnabledDisabled(this.elems.multipleLimitInputElement, this.elems.placeholderCheckboxElement.checked, {multipleLimitInput: params.multipleLimit});
        // setEnabledDisabled(this.elems.multipleVisibleLimitInputElement, this.elems.placeholderCheckboxElement.checked, {multipleVisibleLimitInput: params.multipleVisibleLimit});
        // setEnabledDisabled(this.elems.debounceInputElement, this.elems.placeholderCheckboxElement.checked, {debounceInput: params.debounce});
    }
}