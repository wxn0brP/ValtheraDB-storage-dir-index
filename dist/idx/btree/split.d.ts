import { PageManager } from "../page/index.js";
import { LeafNode } from "./types.js";
export declare function splitLeaf(pm: PageManager, leaf: LeafNode, pageId: number): Promise<void>;
