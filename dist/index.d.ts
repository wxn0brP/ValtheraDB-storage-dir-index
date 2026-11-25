import { ValtheraClass } from "@wxn0brp/db-core";
import { Data } from "@wxn0brp/db-core/types/data";
import type { TypedValthera } from "@wxn0brp/db-core/types/typed";
import { type IndexDirActions } from "./adapter.js";
import type { DirIndexOpts, IndexConfig, ValtheraIndexDirInterface } from "./types.js";
export declare function createDirIndex<T extends Record<string, Data>>(folder: string, indexConfig?: IndexConfig, opts?: DirIndexOpts): TypedValthera<T, ValtheraClass & ValtheraIndexDirInterface>;
export declare function createDirIndexAdapter(folder: string, indexConfig?: IndexConfig, opts?: DirIndexOpts): IndexDirActions;
export declare const DYNAMIC: {
    def: (dir: string, indexConfig?: IndexConfig, dirConfig?: DirIndexOpts) => IndexDirActions;
};
