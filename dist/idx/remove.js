import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { compareValues } from "../utils.js";
import { split } from "../vars.js";
export async function removeFromIndexByData(action, collection, docs, file, keys) {
    for (const key of keys) {
        const indexPath = join(action.folder, collection, `${key}.idx`);
        let content = "";
        try {
            content = await readFile(indexPath, "utf-8");
        }
        catch {
            continue;
        }
        let lines = content.split("\n");
        if (lines.length === 1 && lines[0] === "")
            continue;
        for (const doc of docs) {
            if (doc[key] === undefined)
                continue;
            const value = doc[key];
            let low = 0;
            let high = lines.length - 1;
            let foundIndex = -1;
            while (low <= high) {
                const mid = Math.floor((low + high) / 2);
                const line = lines[mid];
                const [lineValStr, lineFileStr] = line.split(split);
                let cmp = compareValues(lineValStr, value);
                if (cmp === 0) {
                    const lineFile = parseInt(lineFileStr, 10);
                    cmp = lineFile - file;
                }
                if (cmp < 0) {
                    low = mid + 1;
                }
                else if (cmp > 0) {
                    high = mid - 1;
                }
                else {
                    foundIndex = mid;
                    break;
                }
            }
            if (foundIndex !== -1) {
                lines.splice(foundIndex, 1);
            }
        }
        await writeFile(indexPath, lines.join("\n"));
    }
}
