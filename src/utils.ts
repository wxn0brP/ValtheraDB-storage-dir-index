import { VQuery } from "@wxn0brp/db-core/types/query";
import { FileActions } from "@wxn0brp/db-storage-dir";
import { access, readFile, writeFile } from "fs/promises";
import { join } from "path";
import { split } from "./vars";

export async function createIndex(action: FileActions, collection: string, keys: string[]) {
    const files = await action.utils.getSortedFiles(join(action.folder, collection), {});

    for (const key of keys) {
        const indexEntries: { value: any, file: number }[] = [];

        for (const file of files) {
            const fileNumber = parseInt(file.replace(".db", ""), 10);
            const data = await action.fileCpu.find(join(action.folder, collection, file), {});
            if (!data) continue;

            for (const doc of data) {
                if (doc[key] !== undefined) {
                    indexEntries.push({ value: doc[key], file: fileNumber });
                }
            }
        }

        indexEntries.sort((a, b) => {
            if (typeof a.value === "string" && typeof b.value === "string") {
                const cmp = a.value.localeCompare(b.value);
                if (cmp !== 0) return cmp;
            } else {
                if (a.value < b.value) return -1;
                if (a.value > b.value) return 1;
            }

            if (a.file < b.file) return -1;
            if (a.file > b.file) return 1;
            return 0;
        });

        const indexContent = indexEntries.map(entry => `${entry.value}${split}${entry.file}`).join("\n");
        await writeFile(join(action.folder, collection, `${key}.idx`), indexContent);
    }
}

export async function findIndex(action: FileActions, collection: string, key: string, value: any): Promise<number[]> {
    const indexPath = join(action.folder, collection, `${key}.idx`);
    try {
        await access(indexPath);
    } catch {
        return [];
    }

    const indexContent = await readFile(indexPath, "utf-8");
    const lines = indexContent.split("\n");

    const results: number[] = [];

    let low = 0;
    let high = lines.length - 1;
    let firstOccurrence = -1;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const line = lines[mid];
        if (!line) {
            // Handle empty lines if any (usually at end)
            high = mid - 1;
            continue;
        }
        const [midValue] = line.split(split);
        const parsedMidValue = isNaN(Number(midValue)) ? midValue : Number(midValue);

        if (parsedMidValue < value) {
            low = mid + 1;
        } else if (parsedMidValue > value) {
            high = mid - 1;
        } else {
            firstOccurrence = mid;
            high = mid - 1;
        }
    }

    if (firstOccurrence === -1) {
        return [];
    }

    for (let i = firstOccurrence; i < lines.length; i++) {
        if (!lines[i]) continue;
        const [lineValue, fileNumber] = lines[i].split(split);
        const parsedLineValue = isNaN(Number(lineValue)) ? lineValue : Number(lineValue);

        if (parsedLineValue === value) {
            const fileNum = parseInt(fileNumber, 10);
            if (!results.includes(fileNum)) {
                results.push(fileNum);
            }
        } else {
            break;
        }
    }

    return results;
}

export async function removeFromIndex(
    action: FileActions,
    query: VQuery,
    keys: string[],
    one = false
) {
    if (!query.context._dirIndex_files) return;

    const filesToRemove = new Set(query.context._dirIndex_files.map((file: string) => parseInt(file.replace(".db", ""), 10)));

    for (const key of keys) {
        if (!(key in query.search)) continue;
        const valueToRemove = query.search[key];

        const indexPath = join(action.folder, query.collection, `${key}.idx`);
        try {
            await access(indexPath);
        } catch {
            continue;
        }

        const content = await readFile(indexPath, "utf-8");
        const lines = content.split("\n");
        const newLines: string[] = [];
        let removed = false;

        for (const line of lines) {
            if (!line) continue;
            const [valStr, fileNumStr] = line.split(split);
            const fileNum = parseInt(fileNumStr, 10);

            const valMatches = (valStr == String(valueToRemove));
            const fileMatches = filesToRemove.has(fileNum);

            if (valMatches && fileMatches) {
                if (one) {
                    if (!removed) {
                        removed = true;
                        continue;
                    }
                } else {
                    continue;
                }
            }
            newLines.push(line);
        }

        await writeFile(indexPath, newLines.join("\n"));
    }
}
