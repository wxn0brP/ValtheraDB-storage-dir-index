import { FileActions } from "@wxn0brp/db-storage-dir";
export declare function updateIndex(action: FileActions, collection: string, oldData: Record<string, unknown>[], newData: Record<string, unknown>[], file: number, keys: string[]): Promise<void>;
