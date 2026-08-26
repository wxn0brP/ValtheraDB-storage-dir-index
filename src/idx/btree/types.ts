export const PAGE_SIZE = 4096;
export const MAGIC = "BIDX";
export const VERSION = 1;
export const MAX_ENTRIES = 62;
export const MIN_ENTRIES = 31;

export enum PageType {
	Internal = 0,
	Leaf = 1,
	Free = 2,
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
