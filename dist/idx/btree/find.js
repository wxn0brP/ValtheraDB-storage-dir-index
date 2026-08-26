import { compareSafe } from "@wxn0brp/db-core/utils/compare";
import { PageType } from "./types.js";
import { decodeKey } from "./utils.js";
export async function findLeaf(pm, value) {
    let pageId = pm.getHeader().rootPage;
    let node = await pm.readRoot();
    while (node.type === PageType.Internal) {
        const internal = node;
        let childIdx = internal.count;
        for (let i = 0; i < internal.count; i++) {
            const keyVal = decodeKey(internal.keys[i]);
            if (compareSafe(value, keyVal) < 0) {
                childIdx = i;
                break;
            }
        }
        pageId = internal.children[childIdx];
        node = await pm.readPage(pageId);
    }
    return {
        pageId,
        node,
    };
}
export async function findLeftmostLeaf(pm, pageId) {
    let node = await pm.readPage(pageId);
    while (node.type === PageType.Internal) {
        const internal = node;
        pageId = internal.children[0];
        node = await pm.readPage(pageId);
    }
    return node;
}
