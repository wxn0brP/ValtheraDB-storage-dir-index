import Data from "@wxn0brp/db-core/types/data";
import { FileActions } from "@wxn0brp/db-storage-dir";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function createIndex(action: FileActions, collection: string, keys: string[]) {
    const files = await action.utils.getSortedFiles(join(action.folder, collection), {});

    const allData: Data[][] = [];

    for (const file of files) {
        const data = await action.fileCpu.find(join(action.folder, collection, file), {});
        if (!data) continue;
        allData.push(data);
    }

    for (const key of keys) {
        const index: any[][] = [];

        for (const data of allData) {
            index.push(data.map(d => d[key]));
        }

        await writeFile(join(action.folder, collection, `${key}.json`), JSON.stringify(index));
    }
}