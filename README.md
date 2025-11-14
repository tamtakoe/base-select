# BaseSelect component (WIP)

## Demo
https://tamtakoe.github.io/base-select

## Usage
```bash
npm install base-select
```

### As ES6 module
```js
import { Select, SelectWeb } from 'base-select'; // SelectWeb contains base styles in shadow dom

const selectElement = document.getElementById('select');
const selectParams = {
    value: 'b',
    items: ['a', 'b', 'c', 'd']
};
const select = new Select(selectElement, selectParams);

selectElement.addEventListener('change', (e) => {
    console.log('Selected value:', e.value);
});
```

### As global variable
```html
<link href="base-select/select-base.css" rel="stylesheet"/> <!-- If you don't use SelectWeb with included styles -->
<link href="base-select/select-bootstrap.css" rel="stylesheet"/> <!-- If you use Bootstrap -->
<script src="base-select/select.js"></script>

<div id="select"></div>
<script>
    const selectElement = document.getElementById('select');
    const selectParams = {
        value: 'b',
        items: ['a', 'b', 'c', 'd']
    };

    new Select(selectElement, selectParams);
</script>
```

## Examples

### Basic usage with simple array
```js
import { Select } from 'base-select';

const select = new Select(document.getElementById('select'), {
    value: 'b',
    items: ['a', 'b', 'c', 'd']
});
```

### Multiple selection
```js
const select = new Select(document.getElementById('select'), {
    multiple: true,
    value: ['a', 'b'],
    items: ['a', 'b', 'c', 'd', 'e']
});
```

### With objects
```js
const select = new Select(document.getElementById('select'), {
    value: { id: 2, name: 'Item 2' },
    items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' }
    ],
    trackField: 'id',        // Field to identify items
    searchField: 'name',     // Field for searching
    valueField: 'id'         // Field to use as value
});
```

### With grouping
```js
const select = new Select(document.getElementById('select'), {
    multiple: true,
    value: [{ id: 6, name: 'jacket', category: 'clothes' }],
    items: [
        { id: 1, name: 'shirt', category: 'clothes' },
        { id: 2, name: 'pants', category: 'clothes' },
        { id: 3, name: 'apple', category: 'food' },
        { id: 4, name: 'banana', category: 'food' }
    ],
    groupField: 'category',  // Group items by category
    trackField: 'id',
    searchField: 'name',
    valueField: 'id'
});
```

### Async loading with custom getter
```js
const select = new Select(document.getElementById('select'), {
    getItems: (query) => {
        // Return Promise that resolves to array of items
        return fetch(`/api/items?search=${query}`)
            .then(response => response.json())
            .then(data => data.items);
    },
    trackField: 'id',
    searchField: 'name',
    valueField: 'id'
});
```

### With creatable items
```js
const select = new Select(document.getElementById('select'), {
    creatable: { id: null, name: '$query', category: 'new' },
    // Or use function:
    // creatable: true,
    // createItemFn: (query) => ({ id: Date.now(), name: query }),
    items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
    ],
    trackField: 'id',
    searchField: 'name',
    valueField: 'id'
});
```

### Editable select
```js
const select = new Select(document.getElementById('select'), {
    editable: true,
    value: { id: 1, name: 'Item 1' },
    items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
    ],
    trackField: 'id',
    searchField: 'name',
    valueField: 'id'
});
```

### Removable items
```js
const select = new Select(document.getElementById('select'), {
    multiple: true,
    removable: true,
    value: [{ id: 1, name: 'Item 1' }],
    items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
    ],
    trackField: 'id',
    searchField: 'name',
    valueField: 'id',
    removeItemFn: (item) => {
        // Custom remove logic
        return fetch(`/api/items/${item.id}`, { method: 'DELETE' });
    }
});
```

### Keep dropdown open
```js
const select = new Select(document.getElementById('select'), {
    multiple: true,
    keepOpened: true,  // Keep dropdown open after selection
    items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
    ],
    trackField: 'id',
    searchField: 'name'
});
```

### With disabled items
```js
const select = new Select(document.getElementById('select'), {
    items: [
        { id: 1, name: 'Item 1', disabled: false },
        { id: 2, name: 'Item 2', disabled: true },  // This item will be disabled
        { id: 3, name: 'Item 3', disabled: false }
    ],
    disabledField: 'disabled',
    trackField: 'id',
    searchField: 'name',
    valueField: 'id'
});
```

### Limit multiple selections
```js
const select = new Select(document.getElementById('select'), {
    multiple: true,
    multipleLimit: 3,  // Maximum 3 items can be selected
    items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
        { id: 4, name: 'Item 4' }
    ],
    trackField: 'id',
    searchField: 'name',
    valueField: 'id'
});
```

### Using SelectWeb (with built-in styles)
```js
import { SelectWeb } from 'base-select';

// SelectWeb includes base styles in shadow DOM
const select = new SelectWeb(document.getElementById('select'), {
    value: 'b',
    items: ['a', 'b', 'c', 'd']
    // localStyle: false  // Set to false to disable shadow DOM styles
});
```

### Event handling
```js
const selectElement = document.getElementById('select');
const select = new Select(selectElement, {
    value: 'b',
    items: ['a', 'b', 'c', 'd']
});

selectElement.addEventListener('change', (e) => {
    console.log('Selected value:', e.value);
});

// Programmatically update value
select.setParams({ value: 'c' });

// Open/close dropdown
select.open();
select.close();
```

### Custom styling with getters

BaseSelect provides several getter functions that allow you to customize how elements are displayed. These getters return HTML strings (or DOM elements) that will be used to render the component.

#### selectedItemLabelGetter

Customize how selected items are displayed:

```js
import { Select, highlight } from 'base-select';

const select = new Select(document.getElementById('select'), {
    multiple: true,
    items: [
        { id: 1, name: 'Item 1', category: 'A' },
        { id: 2, name: 'Item 2', category: 'B' }
    ],
    trackField: 'id',
    searchField: 'name',
    valueField: 'id',
    // Custom styling for selected items
    selectedItemLabelGetter: (item) => {
        return `<span style="color: blue; font-weight: bold;">${item.name}</span>`;
    }
});
```

#### dropdownItemLabelGetter

Customize how items in the dropdown list are displayed. This getter receives the query parameter for highlighting search matches:

```js
import { Select, highlight } from 'base-select';

const select = new Select(document.getElementById('select'), {
    items: [
        { id: 1, name: 'Apple', price: 10 },
        { id: 2, name: 'Banana', price: 5 }
    ],
    trackField: 'id',
    searchField: 'name',
    valueField: 'id',
    // Custom styling with search highlighting
    dropdownItemLabelGetter: (item, query) => {
        const name = highlight(item.name, query); // Highlight search matches
        return `${name} <span style="color: gray; font-size: 0.9em;">($${item.price})</span>`;
    }
});
```

#### groupLabelGetter

Customize how group headers are displayed:

```js
const select = new Select(document.getElementById('select'), {
    multiple: true,
    items: [
        { id: 1, name: 'Shirt', category: 'Clothes' },
        { id: 2, name: 'Pants', category: 'Clothes' },
        { id: 3, name: 'Apple', category: 'Food' }
    ],
    groupField: 'category',
    trackField: 'id',
    searchField: 'name',
    valueField: 'id',
    // Custom styling for group headers
    groupLabelGetter: (label) => {
        return `<strong style="text-transform: uppercase; color: #666;">${label}</strong>`;
    }
});
```

#### customAreaGetter

Add custom content area inside the dropdown:

```js
const select = new Select(document.getElementById('select'), {
    items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
    ],
    trackField: 'id',
    searchField: 'name',
    valueField: 'id',
    // Add custom area (e.g., for actions, filters, etc.)
    customAreaGetter: function() {
        const customDiv = document.createElement('div');
        customDiv.className = 'custom-area';
        customDiv.innerHTML = '<button>Custom Action</button>';
        customDiv.querySelector('button').addEventListener('click', () => {
            console.log('Custom action clicked');
        });
        return customDiv;
    }
});
```

#### infoGetter

Display information about hidden items when using `multipleVisibleLimit`:

```js
const select = new Select(document.getElementById('select'), {
    multiple: true,
    multipleVisibleLimit: 3, // Show only 3 selected items
    items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
        { id: 4, name: 'Item 4' },
        { id: 5, name: 'Item 5' }
    ],
    trackField: 'id',
    searchField: 'name',
    valueField: 'id',
    // Custom info message for hidden items
    infoGetter: (hiddenItemsNumber) => {
        if (hiddenItemsNumber > 0) {
            return `+${hiddenItemsNumber} more`;
        }
        return '';
    }
});
```

#### Complete example with multiple getters

```js
import { Select, highlight } from 'base-select';

const select = new Select(document.getElementById('select'), {
    multiple: true,
    value: [{ id: 1, name: 'Apple', category: 'Fruits', price: 10 }],
    items: [
        { id: 1, name: 'Apple', category: 'Fruits', price: 10 },
        { id: 2, name: 'Banana', category: 'Fruits', price: 5 },
        { id: 3, name: 'Carrot', category: 'Vegetables', price: 3 }
    ],
    groupField: 'category',
    trackField: 'id',
    searchField: 'name',
    valueField: 'id',
    
    // Style selected items
    selectedItemLabelGetter: (item) => {
        return `<span class="badge">${item.name}</span>`;
    },
    
    // Style dropdown items with price and highlighting
    dropdownItemLabelGetter: (item, query) => {
        const highlightedName = highlight(item.name, query, 'mark');
        return `${highlightedName} <small style="color: #999;">$${item.price}</small>`;
    },
    
    // Style group headers
    groupLabelGetter: (label) => {
        return `<i class="icon-folder"></i> ${label}`;
    },
    
    // Add custom area
    customAreaGetter: function() {
        const div = document.createElement('div');
        div.style.padding = '10px';
        div.style.borderTop = '1px solid #eee';
        div.innerHTML = '<button>Clear all</button>';
        div.querySelector('button').onclick = () => {
            this.setParams({ value: [] });
        };
        return div;
    },
    
    // Info about hidden items
    infoGetter: (hiddenCount) => {
        return hiddenCount > 0 ? `<span class="info">+${hiddenCount} more</span>` : '';
    }
});
```

### With css frameworks
Use the `select-bootstrap.css`, `select-material.css` or `select-foundation.css` (TODO) for Bootstrap, Material etc. frameworks

## Run development server
```bash
npm start
```

## Build for production
```bash
npm run build
```

## Publishing
```bash
npm login
npm publish
```

## TODO
File structure:
```
demo
 ├──appearance.ts
 ├──appearance.html
 ...
 (sources for demo page)
dist
 ├──select.d.ts
 ├──select.js
 ├──select-base.css
 ├──select-bootstrap.css
 ├──select-foundation.css (TODO)
 ├──select-material.css
src
 ├──dom-builder.ts
 ├──myer-array-diff.ts
 ├──utils.ts
 ├──select.ts
 ├──select.html
 ├──select.scss
 ├──select-bootstrap.scss
 ├──select-foundation.scss (TODO)
 └──select-material.scss
index.html (demo page for dev server)
index-demo.html (demo page)
index-build.html (test page for builded module)
index.ts (start point of demo page)
package.json
tsconfig.json
README.md
...
etc.
```
