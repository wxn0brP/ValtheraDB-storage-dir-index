import { compareSafe } from "@wxn0brp/db-core/utils/compare";
import { LeafNode } from "./types";
import { decodeKey } from "./utils";

export function binarySearchLeft(leaf: LeafNode, value: any) {
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
		} else {
			low = mid + 1;
		}
	}

	return result;
}

export function binarySearchInsert(leaf: LeafNode, value: any, file: number) {
	let low = 0;
	let high = leaf.count;

	while (low < high) {
		const mid = Math.floor((low + high) / 2);
		const keyVal = decodeKey(leaf.keys[mid]);
		const cmp = compareSafe(keyVal, value);

		if (cmp < 0) {
			low = mid + 1;
		} else if (cmp > 0) {
			high = mid;
		} else {
			if (leaf.fileNums[mid] < file) {
				low = mid + 1;
			} else {
				high = mid;
			}
		}
	}

	return low;
}
