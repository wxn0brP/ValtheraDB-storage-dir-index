import { createFileAdapter } from "@wxn0brp/db-storage-dir";
import { createIndexDirAdapter } from "./adapter.js";
export function createIndexDirValthera(db, indexConfig) {
    const adapter = createIndexDirAdapter(db.adapter, indexConfig);
    return Object.assign(db, {
        createIndex: (collection) => adapter.createIndex(collection),
    });
}
export const DYNAMIC = {
    "dir-index": (dir, indexConfig = {}, dirConfig = {}) => {
        const dirAdapter = createFileAdapter(dir, dirConfig);
        return createIndexDirAdapter(dirAdapter, indexConfig);
    },
};
