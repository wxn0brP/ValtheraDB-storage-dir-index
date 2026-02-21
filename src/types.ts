import { ValtheraClass } from "@wxn0brp/db-core";

export type IndexConfig = Record<string, string[]>;

export interface ValtheraIndexDirInterface {
    createIndex(collection: string): Promise<void>;
}

export type ValtheraIndexDir<T = ValtheraClass> = T & ValtheraIndexDirInterface;
