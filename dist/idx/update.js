import { addToIndex } from "./add.js";
import { removeFromIndexByData } from "./remove.js";
export async function updateIndex(action, collection, oldData, newData, file, keys) {
    await removeFromIndexByData(action, collection, oldData, file, keys);
    for (const data of newData) {
        await addToIndex(action, collection, data, file, keys);
    }
}
