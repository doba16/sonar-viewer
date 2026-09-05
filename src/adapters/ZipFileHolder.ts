import type { Entry, ZipReader } from "@zip.js/zip.js";

export class ZipFileHolder {
    
    private _zipFile?: ZipReader<unknown>
    private _entries?: Promise<Entry[]>

    get zipFile() {
        return this._zipFile
    }

    set zipFile(zipFile: ZipReader<unknown> | undefined) {
        this._zipFile = zipFile
    }

    async getEntries(): Promise<Entry[]> {
        if (!this._zipFile) {
            throw new Error("No zip file present to get entries from")
        }
        
        if (this._entries !== undefined) {
            return this._entries
        }

        this._entries = this._zipFile?.getEntries()
        return this._entries
    }
}
