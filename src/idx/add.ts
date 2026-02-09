import { FileActions } from "@wxn0brp/db-storage-dir";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { compareValues } from "../utils";
import { split } from "../vars";

export async function addToIndex(
    action: FileActions,
    collection: string,
    data: any,
    file: number,
    keys: string[]
) {
    for (const key of keys) {
        if (data[key] === undefined) continue;
        const value = data[key];

        const indexPath = join(action.folder, collection, `${key}.idx`);
        let content = "";
        try {
            content = await readFile(indexPath, "utf-8");
        } catch {
            // Index doesn't exist, we'll create it
            content = "";
        }

        const lines = content.split("\n");
        if (lines.length === 1 && lines[0] === "") lines.pop();

        const newEntry = `${value}${split}${file}`;

        let low = 0;
        let high = lines.length - 1;
        let insertAt = lines.length;

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
            } else {
                insertAt = mid;
                high = mid - 1;
            }
        }

        lines.splice(insertAt, 0, newEntry);
        await writeFile(indexPath, lines.join("\n"));
    }
}
