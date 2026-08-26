import { createFileAdapter } from "@wxn0brp/db-storage-dir";
import { createIndexDirAdapter } from "../src/adapter.ts";

const TEST_DIR = "/tmp/valthera-e2e-dir-test";

export default async () => {
	await Bun.$`rm -rf ${TEST_DIR}`.quiet();
	const actions = createFileAdapter(TEST_DIR);
	const adapter = createIndexDirAdapter(actions, {});
	await adapter.init();
	adapter._inited = true;
	return adapter;
};
