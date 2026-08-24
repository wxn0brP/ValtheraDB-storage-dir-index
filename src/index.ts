import { ValtheraClass } from "@wxn0brp/db-core";
import { createFileAdapter, FileActions } from "@wxn0brp/db-storage-dir";
import { DbDirOpts } from "@wxn0brp/db-storage-dir/types";
import { createIndexDirAdapter } from "./adapter";
import type { IndexConfig, ValtheraIndexDir } from "./types";

export function createIndexDirValthera<T extends ValtheraClass>(
	db: T,
	indexConfig: IndexConfig,
): ValtheraIndexDir<T> {
	const adapter = createIndexDirAdapter(db.adapter as FileActions, indexConfig);

	return Object.assign(db, {
		createIndex: (collection: string) => adapter.createIndex(collection),
	});
}

export const DYNAMIC = {
	"dir-index": (
		dir: string,
		indexConfig: IndexConfig = {},
		dirConfig: DbDirOpts = {},
	) => {
		const dirAdapter = createFileAdapter(dir, dirConfig);
		return createIndexDirAdapter(dirAdapter, indexConfig);
	},
};
