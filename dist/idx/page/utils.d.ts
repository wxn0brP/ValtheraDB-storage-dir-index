import { PageManager } from "./index.js";
import { BTreeNode, IndexHeader } from "../btree/types.js";
export declare function deserializeNode(buf: Buffer): BTreeNode;
export declare function serializeHeader(header: IndexHeader, buf: Buffer): void;
export declare function deserializeHeader(buf: Buffer): IndexHeader;
export declare function serializeNode(node: BTreeNode, buf: Buffer): void;
export declare function create(filePath: string): Promise<PageManager>;
