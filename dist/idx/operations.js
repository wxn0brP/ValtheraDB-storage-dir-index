import { BTree } from "./btree/index.js";
export async function addToIndex(data, file, keys, pms) {
    for (const key of keys) {
        if (data[key] === undefined)
            continue;
        const value = data[key];
        const pm = pms.get(key);
        const tree = new BTree(pm);
        await tree.insert(value, file);
    }
}
export async function updateIndex(oldData, newData, file, keys, pms) {
    await removeFromIndexByData(oldData, file, keys, pms);
    for (const data of newData) {
        await addToIndex(data, file, keys, pms);
    }
}
export async function findIndex(value, pm) {
    const tree = new BTree(pm);
    return tree.search(value);
}
export async function removeFromIndexByData(docs, file, keys, pms) {
    for (const key of keys) {
        const pm = pms.get(key);
        if (!pm)
            continue;
        const tree = new BTree(pm);
        for (const doc of docs) {
            if (doc[key] === undefined)
                continue;
            await tree.remove(doc[key], file);
        }
    }
}
