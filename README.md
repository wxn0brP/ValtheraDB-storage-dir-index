# @wxn0brp/db-storage-dir-index

Adds BTree-based indexing to ValtheraDB's directory storage.
Sorted index files (`.idx`) allow queries to locate matching
`.db` files via binary search instead of scanning all files.

> Note: Default max file size is **256KB** instead of **2MB**.

## Installation

```bash
bun add @wxn0brp/db-storage-dir-index
```

## Usage

```typescript
import { createDirIndex } from "@wxn0brp/db-storage-dir-index";

const db = createDirIndex<{
  users: {
    email: string;
    login: string;
    _id: string;
  };
  posts: {
    authorId: string;
    category: string;
    _id: string;
  }
}>("./data", {
  users: ["email", "login"],
  posts: ["authorId", "category"],
}); // returns ValtheraDB + Index interface + forgeTypeValthera

await db.createIndex("users");

await db.users.add({ email: "a@b.com", login: "alice" });
await db.users.find({ email: "a@b.com" }); // uses index
```

## License

MIT
