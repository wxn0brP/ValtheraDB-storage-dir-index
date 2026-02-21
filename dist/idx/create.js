import { writeFile } from "fs/promises";
import { join } from "path";
import { compareValues } from "../utils.js";
import { split } from "../vars.js";
export async function createIndex(action, collection, keys) {
    const files = await action.utils.getSortedFiles(join(action.folder, collection), {});
    for (const key of keys) {
        const indexEntries = [];
        for (const file of files) {
            const fileNumber = parseInt(file.replace(".db", ""), 10);
            const data = await action.fileCpu.find(join(action.folder, collection, file), {});
            if (!data)
                continue;
            for (const doc of data) {
                if (doc[key] !== undefined) {
                    indexEntries.push({ value: doc[key], file: fileNumber });
                }
            }
        }
        indexEntries.sort((a, b) => {
            const cmp = compareValues(a.value, b.value);
            if (cmp !== 0)
                return cmp;
            return a.file - b.file;
        });
        const indexContent = indexEntries.map(entry => `${entry.value}${split}${entry.file}`).join("\n");
        await writeFile(join(action.folder, collection, `${key}.idx`), indexContent);
    }
}
