import { ValtheraClass } from "@wxn0brp/db-core";
import { VQuery } from "@wxn0brp/db-core/types/query";
import { FileActions } from "@wxn0brp/db-storage-dir";
import { FileActionsUtils } from "@wxn0brp/db-storage-dir/action.utils";
import { access, readFile } from "fs/promises";
import { join } from "path";
import { IndexConfig } from "./types";
import { removeFromIndex } from "./utils";

export function createIndexDirValthera(db: ValtheraClass, indexConfig: IndexConfig) {
    const dbAction = db.dbAction as FileActions;

    const getSortedFilesOriginal: FileActionsUtils["getSortedFiles"] = dbAction.utils.getSortedFiles.bind(dbAction.utils);

    const getSortedFiles: FileActionsUtils["getSortedFiles"] = async (folder, query) => {
        const files = await getSortedFilesOriginal(folder, query);
        const collectionKeys = indexConfig[query.collection];

        if (!collectionKeys)
            return files;

        const fileIndices = files.map(file => parseInt(file.replace(".db", ""), 10));
        const requiredFiles = new Map();

        for (const key of collectionKeys) {
            if (!(key in query.search)) continue;

            const searchData = query.search[key];
            if (!searchData) continue;

            const indexPath = join(dbAction.folder, query.collection, `${key}.json`);

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

            if (!indexData || !indexData.length) continue;

            for (const index of fileIndices) {
                if (requiredFiles.get(index) === false) continue;

                const val = indexData[index - 1];
                if (!val) continue;

                requiredFiles.set(index, val.includes(searchData));
            }
        }

        const filteredFiles = files
            .filter(file => {
                const index = parseInt(file.replace(".db", ""), 10);
                return requiredFiles.get(index);
            });

        query.context._dirIndex_files = filteredFiles;

        return filteredFiles;
    }

    dbAction.utils.getSortedFiles = getSortedFiles.bind(dbAction.utils);

    const proxy = new Proxy(dbAction, {
        get(target, prop, receiver) {
            const value = target[prop];
            const propString = prop.toString();

            if (propString.includes("remove")) {
                return async (query: VQuery) => {
                    const result = await value.bind(receiver)(query);
                    await removeFromIndex(
                        dbAction,
                        query,
                        indexConfig[query.collection],
                        propString.includes("One")
                    );
                    return result;
                }
            }
            return value;
        }
    });

    db.dbAction = proxy;
}