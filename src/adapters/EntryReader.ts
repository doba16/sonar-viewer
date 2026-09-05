import { Uint8ArrayWriter, type FileEntry } from "@zip.js/zip.js";

export class EntryReader {
    
    private _entry: FileEntry
    private _data?: Promise<Uint8Array>

    constructor(entry: FileEntry) {
        this._entry = entry
    }

    async readUInt32(offset: number): Promise<number> {
        const buffer = await this.obtainData()
        return buffer[offset + 3] << 24 | buffer[offset + 2] << 16 | buffer[offset + 1] << 8 | buffer[offset]
    }

    async readUInt32LE(offset: number): Promise<number> {
        const buffer = await this.obtainData()
        return buffer[offset] << 24 | buffer[offset + 1] << 16 | buffer[offset + 2] << 8 | buffer[offset + 3]
    }

    async size(): Promise<number> {
        return (await this.obtainData()).length
    }

    async slice(start: number, end: number) {
        const buffer = await this.obtainData()
        return buffer.slice(start, end)
    }

    private async obtainData(): Promise<Uint8Array> {
        if (!this._data) {
            this._data = new Promise(async res => {
                const arrayWriter = new Uint8ArrayWriter()
                await this._entry.getData(arrayWriter)
                const bytes = await arrayWriter.getData()
                res(bytes)
            })
        }

        return this._data
    }


}