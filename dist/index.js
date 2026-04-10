import { addToIndex } from "./idx/add.js";
import { createIndex } from "./idx/create.js";
import { findIndex } from "./idx/find.js";
import { removeFromIndexByData } from "./idx/remove.js";
import { updateIndex } from "./idx/update.js";
import { convertResultToArray, getCollectionAndFileNum } from "./utils.js";
export function createIndexDirValthera(db, indexConfig) {
    const dbAction = db.dbAction;
    const getSortedFilesOriginal = dbAction.utils.getSortedFiles.bind(dbAction.utils);
    const getSortedFiles = async (folder, query) => {
        const files = await getSortedFilesOriginal(folder, query);
        const collectionKeys = indexConfig[query.collection];
        if (!collectionKeys || !query.search || typeof query.search !== "object")
            return files;
        let candidateFiles = null;
        for (const key of collectionKeys) {
            if (!(key in query.search))
                continue;
            const searchData = query.search[key];
            if (searchData === undefined)
                continue;
            const foundIndices = await findIndex(dbAction, query.collection, key, searchData);
            const foundSet = new Set(foundIndices);
            if (candidateFiles === null) {
                candidateFiles = foundSet;
            }
            else {
                // Intersect
                candidateFiles = new Set([...candidateFiles].filter(x => foundSet.has(x)));
            }
            if (candidateFiles.size === 0)
                break;
        }
        if (candidateFiles === null) {
            return files;
        }
        const filteredFiles = files
            .filter(file => {
            const index = parseInt(file.replace(".db", ""), 10);
            return candidateFiles.has(index);
        });
        query.control._dirIndex_files = filteredFiles;
        return filteredFiles;
    };
    dbAction.utils.getSortedFiles = getSortedFiles.bind(dbAction.utils);
    const originalFileCpu = dbAction.fileCpu;
    dbAction.fileCpu = new Proxy(originalFileCpu, {
        get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver);
            if (typeof value !== "function")
                return value;
            if (prop === "add") {
                return async (file, config) => {
                    const result = await value.call(target, file, config);
                    const { collection, fileNum } = getCollectionAndFileNum(file, dbAction.folder);
                    const keys = indexConfig[collection];
                    if (keys)
                        await addToIndex(dbAction, collection, config.data, fileNum, keys);
                    return result;
                };
            }
            if (prop === "remove") {
                return async (file, config, one) => {
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
                return async (file, config, one) => {
                    const { collection, fileNum } = getCollectionAndFileNum(file, dbAction.folder);
                    const keys = indexConfig[collection];
                    if (!keys)
                        return await value.call(target, file, config, one);
                    const findResults = await target.find(file, config);
                    if (!findResults || findResults.length === 0)
                        return one ? null : [];
                    const result = await value.call(target, file, config, one);
                    await updateIndex(dbAction, collection, findResults, convertResultToArray(result), fileNum, keys);
                    return result;
                };
            }
            return value.bind(target);
        }
    });
    return Object.assign(db, {
        createIndex: async (collection) => {
            const keys = indexConfig[collection];
            if (!keys)
                return;
            await createIndex(dbAction, collection, keys);
        }
    });
}
