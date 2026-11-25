export function decodeKey(key) {
    if (key.type === 1)
        return key.data.readDoubleLE(0);
    return key.data.toString("utf-8");
}
export function cloneKey(key) {
    return {
        type: key.type,
        data: Buffer.from(key.data),
    };
}
