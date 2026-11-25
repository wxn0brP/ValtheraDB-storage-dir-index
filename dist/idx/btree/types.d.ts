export declare const PAGE_SIZE = 4096;
export declare const MAGIC = "BIDX";
export declare const VERSION = 1;
export declare const MAX_ENTRIES = 62;
export declare const MIN_ENTRIES = 31;
export declare enum PageType {
    Internal = 0,
    Leaf = 1,
    Free = 2
}
export interface IndexHeader {
    rootPage: number;
    nextPage: number;
    count: number;
    freeList: number;
}
export interface InternalNode {
    type: PageType.Internal;
    count: number;
    parent: number;
    children: number[];
    keys: {
        type: number;
        data: Buffer;
    }[];
}
export interface LeafNode {
    type: PageType.Leaf;
    count: number;
    parent: number;
    nextPage: number;
    fileNums: number[];
    keys: {
        type: number;
        data: Buffer;
    }[];
}
export interface FreeNode {
    type: PageType.Free;
    nextFree: number;
}
export type BTreeNode = InternalNode | LeafNode | FreeNode;
export interface NodeRef {
    pageId: number;
    node: BTreeNode;
}
