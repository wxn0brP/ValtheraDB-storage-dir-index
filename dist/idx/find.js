import { access, readFile } from "fs/promises";
import { join } from "path";
import { compareValues } from "../utils.js";
import { split } from "../vars.js";
export async function findIndex(action, collection, key, value) {
    const indexPath = join(action.folder, collection, `${key}.idx`);
    try {
        await access(indexPath);
    }
    catch {
        return [];
    }
    const indexContent = await readFile(indexPath, "utf-8");
    const lines = indexContent.split("\n");
    const results = [];
    let low = 0;
    let high = lines.length - 1;
    let firstOccurrence = -1;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const line = lines[mid];
        if (!line) {
            // Handle empty lines if any (usually at end)
            high = mid - 1;
            continue;
        }
        const [midValue] = line.split(split);
        const cmp = compareValues(midValue, value);
        if (cmp < 0) {
            low = mid + 1;
        }
        else if (cmp > 0) {
            high = mid - 1;
        }
        else {
            firstOccurrence = mid;
            high = mid - 1;
        }
    }
    if (firstOccurrence === -1) {
        return [];
    }
    for (let i = firstOccurrence; i < lines.length; i++) {
        if (!lines[i])
            continue;
        const [lineValue, fileNumber] = lines[i].split(split);
        const cmp = compareValues(lineValue, value);
        if (cmp === 0) {
            const fileNum = parseInt(fileNumber, 10);
            if (!results.includes(fileNum)) {
                results.push(fileNum);
            }
        }
        else {
            break;
        }
    }
    return results;
}
