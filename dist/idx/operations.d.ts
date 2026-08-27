import { PageManager } from "./page/index.js";
export declare function addToIndex(data: Record<string, unknown>, file: number, keys: string[], pms: Map<string, PageManager>): Promise<void>;
export declare function updateIndex(oldData: Record<string, unknown>[], newData: Record<string, unknown>[], file: number, keys: string[], pms: Map<string, PageManager>): Promise<void>;
export declare function findIndex(value: any, pm: PageManager): Promise<number[]>;
export declare function removeFromIndexByData(docs: Record<string, unknown>[], file: number, keys: string[], pms: Map<string, PageManager>): Promise<void>;
