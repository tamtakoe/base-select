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

selectElement.addEventListener('change', (e: any) => {
    console.log('V', e.value);
    updateValue(e.value);
});
```

### As global variable
```html
<link href="base-select/select-base.css" rel="stylesheet"/> // If you don't use SelectWeb with included styles
<link href="base-select/select-bootstrap.css" rel="stylesheet"/> // If you use Bootstrap
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
