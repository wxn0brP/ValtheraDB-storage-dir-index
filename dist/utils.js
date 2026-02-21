import { resolve, sep } from "path";
export function getCollectionAndFileNum(filePath, folder) {
    const absFile = resolve(filePath);
    const absFolder = resolve(folder);
    const relative = absFile.replace(absFolder, "");
    const parts = relative.split(sep).filter(Boolean);
    const fileName = parts.pop();
    const fileNum = parseInt(fileName.replace(".db", ""), 10);
    const collection = parts.join("/");
    return { collection, fileNum };
}
export function compareValues(a, b) {
    let valA = a;
    let valB = b;
    if (typeof valB === "number") {
        const numA = Number(valA);
        if (!isNaN(numA))
            valA = numA;
    }
    else if (typeof valB === "string") {
        valA = String(valA);
    }
    if (typeof valA === "string" && typeof valB === "string") {
        return valA.localeCompare(valB);
    }
    if (valA < valB)
        return -1;
    if (valA > valB)
        return 1;
    return 0;
}
