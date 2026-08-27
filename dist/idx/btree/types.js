export const PAGE_SIZE = 4096;
export const MAGIC = "BIDX";
export const VERSION = 1;
export const MAX_ENTRIES = 62;
export const MIN_ENTRIES = 31;
export var PageType;
(function (PageType) {
    PageType[PageType["Internal"] = 0] = "Internal";
    PageType[PageType["Leaf"] = 1] = "Leaf";
    PageType[PageType["Free"] = 2] = "Free";
})(PageType || (PageType = {}));
