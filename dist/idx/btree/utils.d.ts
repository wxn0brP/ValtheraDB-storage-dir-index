export declare function decodeKey(key: {
    type: number;
    data: Buffer;
}): string | number | boolean | Date;
export declare function cloneKey(key: {
    type: number;
    data: Buffer;
}): {
    type: number;
    data: Buffer<ArrayBuffer>;
};
