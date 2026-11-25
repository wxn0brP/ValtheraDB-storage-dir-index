import { PageManager } from "../page/index.js";
import { LeafNode } from "./types.js";
export declare function rebalanceLeaf(pm: PageManager, leaf: LeafNode, leafPageId: number): Promise<void>;
