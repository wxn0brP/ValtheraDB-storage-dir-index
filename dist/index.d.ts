import { ValtheraClass } from "@wxn0brp/db-core";
import { Collection } from "@wxn0brp/db-core/helpers/collection";
import { Data } from "@wxn0brp/db-core/types/data";
import { type IndexDirActions } from "./adapter.js";
import type { DirIndexOpts, IndexConfig, ValtheraIndexDirInterface } from "./types.js";
export declare function createDirIndex<T extends Record<string, Data>>(folder: string, indexConfig?: IndexConfig, opts?: DirIndexOpts): ValtheraClass & ValtheraIndexDirInterface & {
    [K in keyof T]: Collection<T[K]>;
};
export declare function createDirIndexAdapter(folder: string, indexConfig?: IndexConfig, opts?: DirIndexOpts): IndexDirActions;
export declare const DYNAMIC: {
    "dir-index": (dir: string, indexConfig?: IndexConfig, dirConfig?: DirIndexOpts) => IndexDirActions;
};
