import { resolve, sep } from "path";
export function getCollectionAndFileNum(filePath, folder) {
    const absFile = resolve(filePath);
    const absFolder = resolve(folder);
    const relative = absFile.replace(absFolder, "");
    const parts = relative.split(sep).filter(Boolean);
    const fileName = parts.pop();
    const fileNum = parseInt(fileName.replace(".db", ""), 10);
    const collection = parts.join("/");
    return {
        collection,
        fileNum,
    };
}
export function convertResultToArray(result) {
    if (result === null)
        return [];
    if (Array.isArray(result))
        return result;
    return [
        result,
    ];
}
