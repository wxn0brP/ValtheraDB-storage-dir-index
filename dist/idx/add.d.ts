import { FileActions } from "@wxn0brp/db-storage-dir";
export declare function addToIndex(action: FileActions, collection: string, data: Record<string, unknown>, file: number, keys: string[]): Promise<void>;
