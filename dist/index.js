import { forgeTypedValthera, ValtheraClass } from "@wxn0brp/db-core";
import { createFileAdapter } from "@wxn0brp/db-storage-dir";
import { createIndexDirAdapter } from "./adapter.js";
const DEFAULT_MAX_FILE_SIZE = 256 * 1024;
export function createDirIndex(folder, indexConfig = {}, opts = {}) {
    const adapter = createDirIndexAdapter(folder, indexConfig, opts);
    const db = new ValtheraClass({
        adapter,
    });
    Object.assign(db, {
        createIndex: (collection) => adapter.createIndex(collection),
    });
    return forgeTypedValthera(db);
}
export function createDirIndexAdapter(folder, indexConfig = {}, opts = {}) {
    const dirAdapter = createFileAdapter(folder, {
        maxFileSize: DEFAULT_MAX_FILE_SIZE,
        ...opts,
    });
    return createIndexDirAdapter(dirAdapter, indexConfig);
}
export const DYNAMIC = {
    "dir-index": (dir, indexConfig = {}, dirConfig = {}) => createDirIndexAdapter(dir, indexConfig, dirConfig),
};
