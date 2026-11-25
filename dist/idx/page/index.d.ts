import { type FileHandle } from "fs/promises";
import { type BTreeNode, type IndexHeader } from "../btree/types.js";
export declare class PageManager {
    fd: FileHandle;
    private header;
    rootCache: BTreeNode;
    constructor(fd: FileHandle, header: IndexHeader);
    getHeader(): IndexHeader;
    readPage<T extends BTreeNode>(pageId: number): Promise<T>;
    writePage(pageId: number, node: BTreeNode): Promise<void>;
    readRoot<T extends BTreeNode>(): Promise<T>;
    setRootCache(node: BTreeNode): void;
    allocatePage(): Promise<number>;
    freePage(pageId: number): Promise<void>;
    writeHeader(): Promise<void>;
    close(): Promise<void>;
}
