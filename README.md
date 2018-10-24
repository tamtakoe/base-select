# Base select component

> WORK IN PROGRESS!

## Development
### Run as web component. Limited by Chrome
```bash
npm start
```

### Run without shadow dom in any browser
```bash
npm run start:noShadowDom
```

### Build
```bash
npm run build
```

### TODO
File structure:
```
demo
 ├──appearance.ts
 ├──appearance.html
 ...
 (sources for demo page)
tests
 ├──test1.spec.js
 ...
dist
 ├──dom-builder.d.ts
 ├──myer-array-diff.d.ts
 ├──utils.d.ts
 ├──select.d.ts
 ├──select.js
 ├──select.js.map
 ├──select.min.js
 ├──select.min.js.map
 ├──select.css
 ├──select.min.css
 ├──select-bootstrap.css
 ├──select-bootstrap.min.css
 ├──select-foundation.css
 ├──select-foundation.min.css
 ├──select-material.scss
 ├──select-material.min.scss
 ├──select-web.js (shadow dom/ web component - base syles included)
 ├──select-web.js.map
 ├──select-web.min.js
 └──select-web.min.js.map
src
 ├──dom-builder.ts
 ├──myer-array-diff.ts
 ├──utils.ts
 ├──select.ts
 ├──select.html
 ├──select.scss
 ├──select-bootstrap.scss
 ├──select-foundation.scss
 └──select-material.scss
index.html (demo page)
index-bootstrap.html (fallbacks for browsers without shadow dom)
index-foundation.html
index-material.html
index.ts (start point of demo page)
index.js (compiled)
package.json
tsconfig.json
README.md
...
etc.
```

Commands:
```
npm start (local dev-server)
npm run build
npm run test
```