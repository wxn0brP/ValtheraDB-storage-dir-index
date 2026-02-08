import Data from "@wxn0brp/db-core/types/data";
import { VQuery } from "@wxn0brp/db-core/types/query";
import { FileActions } from "@wxn0brp/db-storage-dir";
import { access, readFile, writeFile } from "fs/promises";
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

export async function removeFromIndex(
    action: FileActions,
    query: VQuery,
    keys: string[],
    one = false
) {
    const files = query.context._dirIndex_files.map(file => parseInt(file.replace(".db", ""), 10));

    const temp: Set<any>[] = Array.from({ length: files.length }).map(() => new Set());
    const missingKeys = [];

    for (const key of keys) {
        if (!(key in query.search)) {
            missingKeys.push(key);
            continue;
        }

        const indexPath = join(action.folder, query.collection, `${key}.json`);

        try {
            await access(indexPath);
        } catch {
            continue;
        }

        const indexData: any[] =
            JSON.parse(
                await readFile(
                    indexPath,
                    "utf-8"
                )
            );

        for (let i = 0; i < files.length; i++) {
            const fileNumber = files[i];
            const data: any[] = indexData[fileNumber - 1];

            if (one) {
                const index = data.indexOf(query.search[key]);
                if (index === -1)
                    continue;

                data.splice(index, 1);
                temp[i].add(index);

                // Only first
                break;
            } else {
                indexData[fileNumber - 1] = data.filter((d, idx) => {
                    const res = d !== query.search[key];
                    if (!res)
                        temp[i].add(idx);
                    return res;
                });
            }
        }

        await writeFile(indexPath, JSON.stringify(indexData));
    }

    for (const key of missingKeys) {
        const indexPath = join(action.folder, query.collection, `${key}.json`);
        try {
            await access(indexPath);
        } catch {
            continue;
        }

        const indexData: any[] =
            JSON.parse(
                await readFile(
                    indexPath,
                    "utf-8"
                )
            );

        for (let i = 0; i < files.length; i++) {
            const fileNumber = files[i] - 1;
            const tempData = temp[i];
            const data: any[] = indexData[fileNumber];

            indexData[fileNumber] = data.filter((_, i) => !tempData.has(i));
        }

        await writeFile(indexPath, JSON.stringify(indexData));
    }
}