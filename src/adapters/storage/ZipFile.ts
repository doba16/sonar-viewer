import type { Entry, ZipReader } from "@zip.js/zip.js";
import { EntryReader } from "./EntryReader";

export class ZipFile {

    private _entries: Entry[]

    // TODO when switching between recordings, the entries are never garbage collected
    private _entryReaderMap = new Map<string, EntryReader>()

    private constructor(entries: Entry[]) {
        this._entries = entries
    }

    static async fromZipReader(zipReader: ZipReader<unknown>): Promise<ZipFile> {
        const entries = await zipReader.getEntries()
        return new ZipFile(entries)
    }

    async getEntryReader(entry: Entry): Promise<EntryReader> {
        let reader = this._entryReaderMap.get(entry.filename)

        if (reader !== undefined) {
            console.log(`Got entry reader for file '${entry.filename}' from cache.`)
            return reader
        }

        if (entry.directory) {
            throw new Error(`Entry '${entry.filename}' is a directory.`)
        }

        const startTime = Date.now()
        reader = await EntryReader.fromFileEntry(entry)
        this._entryReaderMap.set(entry.filename, reader)
        console.log(`Created new entry reader for file '${entry.filename}'. Took ${Date.now() - startTime}ms.`)
        
        return reader
    }

    getEntries() {
        return this._entries
    }

}