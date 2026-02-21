import { ValtheraClass } from "@wxn0brp/db-core";
import { IndexConfig, ValtheraIndexDir } from "./types.js";
export declare function createIndexDirValthera<T extends ValtheraClass>(db: T, indexConfig: IndexConfig): ValtheraIndexDir<T>;
