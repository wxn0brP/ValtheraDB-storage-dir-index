import { compareSafe } from "@wxn0brp/db-core/utils/compare";
import { decodeKey } from "./utils.js";
export function binarySearchLeft(leaf, value) {
    let low = 0;
    let high = leaf.count - 1;
    let result = leaf.count;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const keyVal = decodeKey(leaf.keys[mid]);
        const cmp = compareSafe(keyVal, value);
        if (cmp >= 0) {
            result = mid;
            high = mid - 1;
        }
        else {
            low = mid + 1;
        }
    }
    return result;
}
export function binarySearchInsert(leaf, value, file) {
    let low = 0;
    let high = leaf.count;
    while (low < high) {
        const mid = Math.floor((low + high) / 2);
        const keyVal = decodeKey(leaf.keys[mid]);
        const cmp = compareSafe(keyVal, value);
        if (cmp < 0) {
            low = mid + 1;
        }
        else if (cmp > 0) {
            high = mid;
        }
        else {
            if (leaf.fileNums[mid] < file) {
                low = mid + 1;
            }
            else {
                high = mid;
            }
        }
    }
    return low;
}
