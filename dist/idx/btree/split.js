import { MAX_ENTRIES, PageType } from "./types.js";
import { cloneKey } from "./utils.js";
export async function splitLeaf(pm, leaf, pageId) {
    const mid = Math.floor(leaf.count / 2);
    const newPageId = await pm.allocatePage();
    const newLeaf = {
        type: PageType.Leaf,
        count: leaf.count - mid,
        parent: leaf.parent,
        nextPage: leaf.nextPage,
        fileNums: leaf.fileNums.slice(mid),
        keys: leaf.keys.slice(mid),
    };
    leaf.count = mid;
    leaf.fileNums = leaf.fileNums.slice(0, mid);
    leaf.keys = leaf.keys.slice(0, mid);
    leaf.nextPage = newPageId;
    await pm.writePage(newPageId, newLeaf);
    await pm.writePage(pageId, leaf);
    const separator = cloneKey(newLeaf.keys[0]);
    await insertIntoParent(pm, pageId, separator, newPageId);
}
async function splitInternal(pm, node, pageId) {
    const mid = Math.floor(node.count / 2);
    const separator = cloneKey(node.keys[mid]);
    const newPageId = await pm.allocatePage();
    const newNode = {
        type: PageType.Internal,
        count: node.count - mid - 1,
        parent: node.parent,
        children: node.children.slice(mid + 1),
        keys: node.keys.slice(mid + 1),
    };
    node.count = mid;
    node.children = node.children.slice(0, mid + 1);
    node.keys = node.keys.slice(0, mid);
    for (const childId of newNode.children) {
        const child = await pm.readPage(childId);
        if (child.type === PageType.Internal || child.type === PageType.Leaf) {
            child.parent = newPageId;
            await pm.writePage(childId, child);
        }
    }
    await pm.writePage(newPageId, newNode);
    await pm.writePage(pageId, node);
    await insertIntoParent(pm, pageId, separator, newPageId);
}
async function insertIntoParent(pm, leftPageId, separator, rightPageId) {
    const header = pm.getHeader();
    const leftNode = await pm.readPage(leftPageId);
    const parentId = leftNode.type === PageType.Internal || leftNode.type === PageType.Leaf
        ? leftNode.parent
        : 0;
    if (parentId === 0) {
        const newRootId = await pm.allocatePage();
        const newRoot = {
            type: PageType.Internal,
            count: 1,
            parent: 0,
            children: [
                leftPageId,
                rightPageId,
            ],
            keys: [
                separator,
            ],
        };
        await pm.writePage(newRootId, newRoot);
        if (leftNode.type === PageType.Internal ||
            leftNode.type === PageType.Leaf) {
            leftNode.parent = newRootId;
            await pm.writePage(leftPageId, leftNode);
        }
        const rightNode = await pm.readPage(rightPageId);
        if (rightNode.type === PageType.Internal ||
            rightNode.type === PageType.Leaf) {
            rightNode.parent = newRootId;
            await pm.writePage(rightPageId, rightNode);
        }
        header.rootPage = newRootId;
        pm.setRootCache(newRoot);
        await pm.writeHeader();
        return;
    }
    const parent = parentId === header.rootPage
        ? await pm.readRoot()
        : await pm.readPage(parentId);
    let childIdx = -1;
    for (let i = 0; i <= parent.count; i++) {
        if (parent.children[i] === leftPageId) {
            childIdx = i;
            break;
        }
    }
    parent.keys.splice(childIdx, 0, separator);
    parent.children.splice(childIdx + 1, 0, rightPageId);
    parent.count++;
    const rightNode = await pm.readPage(rightPageId);
    if (rightNode.type === PageType.Internal ||
        rightNode.type === PageType.Leaf) {
        rightNode.parent = parentId;
        await pm.writePage(rightPageId, rightNode);
    }
    await pm.writePage(parentId, parent);
    if (parent.count > MAX_ENTRIES) {
        await splitInternal(pm, parent, parentId);
    }
}
