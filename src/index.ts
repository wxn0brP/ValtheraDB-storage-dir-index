import { ValtheraClass } from "@wxn0brp/db-core";
import { FileActions } from "@wxn0brp/db-storage-dir";
import { FileActionsUtils } from "@wxn0brp/db-storage-dir/action.utils";
import { addToIndex } from "./idx/add";
import { findIndex } from "./idx/find";
import { removeFromIndexByData } from "./idx/remove";
import { IndexConfig } from "./types";
import { getCollectionAndFileNum } from "./utils";

export function createIndexDirValthera(db: ValtheraClass, indexConfig: IndexConfig) {
    const dbAction = db.dbAction as FileActions;

    const getSortedFilesOriginal: FileActionsUtils["getSortedFiles"] = dbAction.utils.getSortedFiles.bind(dbAction.utils);

    const getSortedFiles: FileActionsUtils["getSortedFiles"] = async (folder, query) => {
        const files = await getSortedFilesOriginal(folder, query);
        const collectionKeys = indexConfig[query.collection!];

        if (!collectionKeys || !query.search || typeof query.search !== "object")
            return files;

        let candidateFiles: Set<number> | null = null;

        for (const key of collectionKeys) {
            if (!(key in query.search)) continue;

            const searchData = (query.search as any)[key];
            if (searchData === undefined) continue;

            const foundIndices = await findIndex(dbAction, query.collection!, key, searchData);
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

        query.context!._dirIndex_files = filteredFiles;

        return filteredFiles;
    }

    dbAction.utils.getSortedFiles = getSortedFiles.bind(dbAction.utils);

    const originalFileCpu = dbAction.fileCpu;
    dbAction.fileCpu = new Proxy(originalFileCpu, {
        get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver);
            if (typeof value !== "function") return value;

            if (prop === "add") {
                return async (file: string, data: any) => {
                    const result = await value.call(target, file, data);
                    const { collection, fileNum } = getCollectionAndFileNum(file, dbAction.folder);
                    const keys = indexConfig[collection];
                    if (keys) {
                        await addToIndex(dbAction, collection, data, fileNum, keys);
                    }
                    return result;
                };
            }

            if (prop === "remove") {
                return async (file: string, one: boolean, search: any, context: any) => {
                    const { collection, fileNum } = getCollectionAndFileNum(file, dbAction.folder);
                    const keys = indexConfig[collection];

                    if (!keys)
                        return await value.call(target, file, one, search, context);

                    let matches: any[] = [];
                    if (one) {
                        const match = await target.findOne(file, search, context);
                        if (match) matches = [match];
                    } else {
                        const results = await target.find(file, search, context);
                        if (results) matches = results;
                    }

                    const result = await value.call(target, file, one, search, context);
                    if (result && matches.length > 0) {
                        await removeFromIndexByData(dbAction, collection, matches, fileNum, keys);
                    }
                    return result;
                };
            }

            return value.bind(target);
        }
    });
}
