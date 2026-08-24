import { FileActions } from "@wxn0brp/db-storage-dir";
export declare function removeFromIndexByData(action: FileActions, collection: string, docs: Record<string, unknown>[], file: number, keys: string[]): Promise<void>;
