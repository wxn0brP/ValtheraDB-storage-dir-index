import type { VQueryT } from "@wxn0brp/db-core/types/query";
import { FileAdapter } from "@wxn0brp/db-storage-dir";
import type { IndexConfig } from "./types.js";
export interface IndexDirActions extends FileAdapter {
    createIndex(config: VQueryT.CreateIndex | string): Promise<void>;
}
export declare function createIndexDirAdapter(action: FileAdapter, indexConfig: IndexConfig): IndexDirActions;
