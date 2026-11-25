import { PageManager } from "../page/index.js";
export declare class BTree {
    pm: PageManager;
    constructor(pm: PageManager);
    search(value: any): Promise<number[]>;
    insert(value: any, file: number): Promise<void>;
    remove(value: any, file: number): Promise<boolean>;
    bulkLoad(entries: {
        value: any;
        file: number;
    }[]): Promise<void>;
    close(): Promise<void>;
    encodeKey(value: any): {
        type: number;
        data: Buffer;
    };
}
