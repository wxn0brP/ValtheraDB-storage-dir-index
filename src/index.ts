import { ValtheraClass } from "@wxn0brp/db-core";
import type { VQueryT } from "@wxn0brp/db-core/types/query";
import { FileActions } from "@wxn0brp/db-storage-dir";
import { FileActionsUtils } from "@wxn0brp/db-storage-dir/action.utils";
import { addToIndex } from "./idx/add";
import { createIndex } from "./idx/create";
import { findIndex } from "./idx/find";
import { removeFromIndexByData } from "./idx/remove";
import { updateIndex } from "./idx/update";
import { IndexConfig, ValtheraIndexDir } from "./types";
import { convertResultToArray, getCollectionAndFileNum } from "./utils";

export function createIndexDirValthera<T extends ValtheraClass>(db: T, indexConfig: IndexConfig): ValtheraIndexDir<T> {
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

        query.control._dirIndex_files = filteredFiles;

        return filteredFiles;
    }

    dbAction.utils.getSortedFiles = getSortedFiles.bind(dbAction.utils);

    const originalFileCpu = dbAction.fileCpu;
    dbAction.fileCpu = new Proxy(originalFileCpu, {
        get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver);
            if (typeof value !== "function") return value;

            if (prop === "add") {
                return async (file: string, config: VQueryT.Add) => {
                    const result = await value.call(target, file, config);
                    const { collection, fileNum } = getCollectionAndFileNum(file, dbAction.folder);
                    const keys = indexConfig[collection];
                    if (keys)
                        await addToIndex(dbAction, collection, config.data, fileNum, keys);

                    return result;
                };
            }

            if (prop === "remove") {
                return async (file: string, config: VQueryT.Remove, one: boolean) => {
                    const { collection, fileNum } = getCollectionAndFileNum(file, dbAction.folder);
                    const keys = indexConfig[collection];

                    if (!keys)
                        return await value.call(target, file, config, one);

                    const result = await value.call(target, file, config, one);
                    const matches = convertResultToArray(result);

                    if (matches.length > 0)
                        await removeFromIndexByData(dbAction, collection, matches, fileNum, keys);

                    return result;
                };
            }

            if (prop === "update") {
                return async (file: string, config: VQueryT.Update, one: boolean) => {
                    const { collection, fileNum } = getCollectionAndFileNum(file, dbAction.folder);
                    const keys = indexConfig[collection];

                    if (!keys)
                        return await value.call(target, file, config, one);

                    const findResults = await target.find(file, config);
                    if (!findResults || findResults.length === 0) return one ? null : [];

                    const result = await value.call(target, file, config, one);

                    await updateIndex(
                        dbAction,
                        collection,
                        findResults,
                        convertResultToArray(result),
                        fileNum,
                        keys
                    );

                    return result;
                };
            }

            return value.bind(target);
        }
    });

    return Object.assign(db, {
        createIndex: async (collection: string) => {
            const keys = indexConfig[collection];
            if (!keys) return;
            await createIndex(dbAction, collection, keys);
        }
    });
}
