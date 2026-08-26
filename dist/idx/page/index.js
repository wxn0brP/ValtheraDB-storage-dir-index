import { PAGE_SIZE, PageType, } from "../btree/types.js";
import { deserializeNode, serializeHeader, serializeNode } from "./utils.js";
export class PageManager {
    fd;
    header;
    rootCache = null;
    constructor(fd, header) {
        this.fd = fd;
        this.header = header;
    }
    getHeader() {
        return this.header;
    }
    async readPage(pageId) {
        if (pageId === 0)
            throw new Error("Cannot read header as node");
        const buf = Buffer.alloc(PAGE_SIZE);
        await this.fd.read(buf, 0, PAGE_SIZE, pageId * PAGE_SIZE);
        return deserializeNode(buf);
    }
    async writePage(pageId, node) {
        const buf = Buffer.alloc(PAGE_SIZE);
        serializeNode(node, buf);
        await this.fd.write(buf, 0, PAGE_SIZE, pageId * PAGE_SIZE);
    }
    async readRoot() {
        if (this.rootCache)
            return this.rootCache;
        this.rootCache = await this.readPage(this.header.rootPage);
        return this.rootCache;
    }
    setRootCache(node) {
        this.rootCache = node;
    }
    async allocatePage() {
        let pageId;
        if (this.header.freeList !== 0) {
            pageId = this.header.freeList;
            const buf = Buffer.alloc(PAGE_SIZE);
            await this.fd.read(buf, 0, PAGE_SIZE, pageId * PAGE_SIZE);
            const freeNode = deserializeNode(buf);
            this.header.freeList = freeNode.nextFree;
        }
        else {
            pageId = this.header.nextPage;
            this.header.nextPage++;
        }
        await this.writeHeader();
        return pageId;
    }
    async freePage(pageId) {
        const freeNode = {
            type: PageType.Free,
            nextFree: this.header.freeList,
        };
        await this.writePage(pageId, freeNode);
        this.header.freeList = pageId;
        await this.writeHeader();
    }
    async writeHeader() {
        const buf = Buffer.alloc(PAGE_SIZE);
        serializeHeader(this.header, buf);
        await this.fd.write(buf, 0, PAGE_SIZE, 0);
    }
    async close() {
        await this.fd.close();
    }
}
