import { FileActions } from "@wxn0brp/db-storage-dir";
import { addToIndex } from "./add";
import { removeFromIndexByData } from "./remove";

export async function updateIndex(
    action: FileActions,
    collection: string,
    oldData: Record<string, unknown>[],
    newData: Record<string, unknown>[],
    file: number,
    keys: string[]
) {
    await removeFromIndexByData(action, collection, oldData, file, keys);

    for (const data of newData) {
        await addToIndex(action, collection, data, file, keys);
    }
}
