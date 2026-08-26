import { forgeTypedValthera, ValtheraClass } from "@wxn0brp/db-core";
import { Collection } from "@wxn0brp/db-core/helpers/collection";
import { Data } from "@wxn0brp/db-core/types/data";
import { createFileAdapter } from "@wxn0brp/db-storage-dir";
import { createIndexDirAdapter, type IndexDirActions } from "./adapter";
import type {
	DirIndexOpts,
	IndexConfig,
	ValtheraIndexDirInterface,
} from "./types";

const DEFAULT_MAX_FILE_SIZE = 256 * 1024;

export function createDirIndex<T extends Record<string, Data>>(
	folder: string,
	indexConfig: IndexConfig = {},
	opts: DirIndexOpts = {},
): ValtheraClass &
	ValtheraIndexDirInterface & {
		[K in keyof T]: Collection<T[K]>;
	} {
	const adapter = createDirIndexAdapter(folder, indexConfig, opts);
	const db = new ValtheraClass({
		adapter,
	});

	Object.assign(db, {
		createIndex: (collection: string) => adapter.createIndex(collection),
	});

	return forgeTypedValthera(db) as any;
}

export function createDirIndexAdapter(
	folder: string,
	indexConfig: IndexConfig = {},
	opts: DirIndexOpts = {},
): IndexDirActions {
	const dirAdapter = createFileAdapter(folder, {
		maxFileSize: DEFAULT_MAX_FILE_SIZE,
		...opts,
	});
	return createIndexDirAdapter(dirAdapter, indexConfig);
}

export const DYNAMIC = {
	"dir-index": (
		dir: string,
		indexConfig: IndexConfig = {},
		dirConfig: DirIndexOpts = {},
	) => createDirIndexAdapter(dir, indexConfig, dirConfig),
};
