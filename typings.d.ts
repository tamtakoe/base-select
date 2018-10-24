declare module "*.json" {
    const value: any;
    export default value;
}

declare module '*.html' {
    const value: Function;
    export default value;
}

declare module '*.css' {
    const value: any;
    export default value
}

declare module '*.scss' {
    const value: any;
    export default value
}

// declare function require(string): string;

// declare module '*.scss' {
//     const contents: string
//     export default contents
// }

// declare module '!raw-loader!*' {
//     const contents: string
//     export default contents
// }

// declare module '*.scss' {
//     interface IClassNames {
//         [className: string]: string
//     }
//     const classNames: IClassNames;
//     export default classNames;
// }