import { ValtheraClass } from "@wxn0brp/db-core";
import { VQuery } from "@wxn0brp/db-core/types/query";
import { FileActions } from "@wxn0brp/db-storage-dir";
import { FileActionsUtils } from "@wxn0brp/db-storage-dir/action.utils";
import { IndexConfig } from "./types";
import { findIndex, removeFromIndex } from "./utils";

export function createIndexDirValthera(db: ValtheraClass, indexConfig: IndexConfig) {
    const dbAction = db.dbAction as FileActions;

    const getSortedFilesOriginal: FileActionsUtils["getSortedFiles"] = dbAction.utils.getSortedFiles.bind(dbAction.utils);

    const getSortedFiles: FileActionsUtils["getSortedFiles"] = async (folder, query) => {
        const files = await getSortedFilesOriginal(folder, query);
        const collectionKeys = indexConfig[query.collection];

        if (!collectionKeys)
            return files;

        let candidateFiles: Set<number> | null = null;

        for (const key of collectionKeys) {
            if (!(key in query.search)) continue;

            const searchData = query.search[key];
            if (searchData === undefined) continue;

            const foundIndices = await findIndex(dbAction, query.collection, key, searchData);
            const foundSet = new Set(foundIndices);

            if (candidateFiles === null) {
                candidateFiles = foundSet;
            } else {
                // Intersect
                candidateFiles = new Set([...candidateFiles].filter(x => foundSet.has(x)));
            }

            if (candidateFiles.size === 0) break;
        }

        if (candidateFiles === null) {
            return files;
        }

        const filteredFiles = files
            .filter(file => {
                const index = parseInt(file.replace(".db", ""), 10);
                return candidateFiles!.has(index);
            });

        query.context._dirIndex_files = filteredFiles;

        return filteredFiles;
    }

    dbAction.utils.getSortedFiles = getSortedFiles.bind(dbAction.utils);

    const proxy = new Proxy(dbAction, {
        get(target, prop, receiver) {
            const value = target[prop as keyof FileActions];
            const propString = prop.toString();

            if (propString.includes("remove")) {
                return async (query: VQuery) => {
                    const result = await (value as Function).bind(receiver)(query);
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
