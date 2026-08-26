import { FileActions } from "@wxn0brp/db-storage-dir";
import type { IndexConfig } from "./types.js";
export interface IndexDirActions extends FileActions {
    createIndex(collection: string): Promise<void>;
}
export declare function createIndexDirAdapter(action: FileActions, indexConfig: IndexConfig): IndexDirActions;
