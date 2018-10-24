export declare const LZString: {
    compressToBase64: (input: any) => string;
    decompressFromBase64: (input: any) => string;
    compressToUTF16: (input: any) => string;
    decompressFromUTF16: (compressed: any) => string;
    compressToUint8Array: (uncompressed: any) => Uint8Array;
    decompressFromUint8Array: (compressed: any) => string;
    compressToEncodedURIComponent: (input: any) => string;
    decompressFromEncodedURIComponent: (input: any) => string;
    compress: (uncompressed: any) => string;
    _compress: (uncompressed: any, bitsPerChar: any, getCharFromInt: any) => string;
    decompress: (compressed: any) => string;
    _decompress: (length: any, resetValue: any, getNextValue: any) => string;
};
