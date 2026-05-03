# @wxn0brp/db-storage-dir-index

This package adds an indexing mechanism to ValtheraDB's directory storage. By maintaining sorted index files (`.idx`) for specified document keys, queries can quickly locate matching files using binary search, significantly speeding up query searches.

## Installation

```bash
bun add @wxn0brp/db-storage-dir-index @wxn0brp/db
```

## Usage

```typescript
import { ValtheraCreate } from "@wxn0brp/db";
import { createIndexDirValthera } from "@wxn0brp/db-storage-dir-index";

const db = ValtheraCreate("data");

const indexConfig = {
  users: ["email", "username"],
  posts: ["authorId", "category"]
};

const dbIndex = createIndexDirValthera(db, indexConfig);

// Create indexes for a collection
await dbIndex.createIndex("users");
```

## API

### `createIndexDirValthera(db, indexConfig)`

Wraps a ValtheraDB instance with indexing capabilities.

**Parameters:**
- `db` - ValtheraDB instance using directory storage
- `indexConfig` - Configuration object mapping collection names to arrays of keys to index

**Returns:** Enhanced ValtheraDB instance with `createIndex(collection)` method.

### `db.createIndex(collection)`

Creates index files for all configured keys in the specified collection. Must be called after initial data setup or when adding new indexed keys.

## License

MIT
