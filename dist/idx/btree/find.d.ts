import { PageManager } from "../page/index.js";
import { LeafNode, NodeRef } from "./types.js";
export declare function findLeaf(pm: PageManager, value: any): Promise<NodeRef>;
export declare function findLeftmostLeaf(pm: PageManager, pageId: number): Promise<LeafNode>;
