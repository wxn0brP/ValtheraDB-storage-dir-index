import { ValtheraClass } from "@wxn0brp/db-core";
import { DbDirOpts } from "@wxn0brp/db-storage-dir/types";
import type { IndexConfig, ValtheraIndexDir } from "./types.js";
export declare function createIndexDirValthera<T extends ValtheraClass>(db: T, indexConfig: IndexConfig): ValtheraIndexDir<T>;
export declare const DYNAMIC: {
    "dir-index": (dir: string, indexConfig?: IndexConfig, dirConfig?: DbDirOpts) => import("./adapter.js").IndexDirActions;
};
