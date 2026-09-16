import { Uint8ArrayWriter, type FileEntry } from "@zip.js/zip.js"

export class EntryReader {
    private _data: Uint8Array

    private constructor(data: Uint8Array) {
        this._data = data
    }

    static async fromFileEntry(entry: FileEntry): Promise<EntryReader> {
        const arrayWriter = new Uint8ArrayWriter()
        await entry.getData(arrayWriter)
        const bytes = await arrayWriter.getData()
        return new EntryReader(bytes) 
    }

    readUInt32(offset: number): number {
        const buffer = this._data
        return buffer[offset + 3] << 24 | buffer[offset + 2] << 16 | buffer[offset + 1] << 8 | buffer[offset]
    }

    readUInt32LE(offset: number): number {
        const buffer = this._data
        return buffer[offset] << 24 | buffer[offset + 1] << 16 | buffer[offset + 2] << 8 | buffer[offset + 3]
    }

    readUInt16LE(offset: number): number {
        const buffer = this._data
        return buffer[offset] << 8 | buffer[offset + 1]
    }

    readUInt8(offset: number): number {
        const buffer = this._data
        return buffer[offset]
    }

    size(): number {
        return this._data.length
    }

    slice(start: number, end: number) {
        return this._data.slice(start, end)
    }

}