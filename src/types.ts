import { ValtheraClass } from "@wxn0brp/db-core";

export type IndexConfig = Record<string, string[]>;

export interface ValtheraIndexDirInterface {
    createIndex(collection: string): Promise<void>;
}

export type ValtheraIndexDir<T = ValtheraClass> = T & ValtheraIndexDirInterface;

declare module "@wxn0brp/db-core/types/query" {
    export interface VQuery_Control {
        _dirIndex_files?: string[];
    }
}
