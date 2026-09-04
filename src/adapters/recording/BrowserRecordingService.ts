import { BlobReader, Uint8ArrayWriter, ZipReader, type FileEntry } from "@zip.js/zip.js";
import type { Recording } from "../../domain/recording/Recording";
import type { RecordingService } from "../../domain/recording/RecordingService";

function readUint32(buffer: Uint8Array, offset: number) {
  return buffer[offset + 3] << 24 | buffer[offset + 2] << 16 | buffer[offset + 1] << 8 | buffer[offset]
}

export class BrowserRecordingService implements RecordingService {

    private zipFile?: ZipReader<unknown>

    private inputElement: HTMLInputElement

    private recordingsOpenedCallback?: (recordings: Recording[]) => void

    constructor() {
        this.inputElement = document.createElement("input")
        this.inputElement.type = "file"
        this.inputElement.addEventListener("change", this.handleFileInputChange.bind(this))
    }

    isOpenDirectorySupported(): boolean {
        return false
    }

    openDirectory() {
        throw new Error("Opening directories not supported by web app.")
    }

    isOpenZipSupported(): boolean {
        return true
    }

    openZip(): void {
        this.inputElement.click()
    }

    setRecordingsOpenedCallback(callback: (recordings: Recording[]) => void): void {
        this.recordingsOpenedCallback = callback
    }

    clearRecordingsService(): void {
        this.recordingsOpenedCallback = undefined
    }

    private async handleFileInputChange() {
        const inputFile = this.inputElement.files?.[0]

        // Require exactly one uploaded file
        if (inputFile === undefined) return

        // Read zip file
        try {
            this.zipFile = this.createZipReader(inputFile)

            const recordings = await this.findRecordings(this.zipFile)
            this.recordingsOpenedCallback?.(recordings)
        } catch (e) {
            console.log(e)
            alert("Could not read zip file!")
        }
    }

    private createZipReader(file: File): ZipReader<unknown> {
        const blob = new Blob([file], { type: file.type })
        const blobReader = new BlobReader(blob)
        return new ZipReader(blobReader)
    }

    private async findRecordings(zipFile: ZipReader<unknown>): Promise<Recording[]> {
        const entries = await zipFile.getEntries()
        
        const recs: Recording[] = []
    
        for (const entry of entries) {
            if (entry.directory) continue
    
            if (entry.filename.toLowerCase().endsWith(".dat")) {
                recs.push(await this.readDatEntry(entry))
            }
        }
    
        return recs
    }

    private async readDatEntry(entry: FileEntry): Promise<Recording> {
        const arrayWriter = new Uint8ArrayWriter()
        await entry.getData(arrayWriter)
        const bytes = await arrayWriter.getData()

        const startTime = readUint32(bytes, 20)
        const duration = readUint32(bytes, 48)
        const numberOfPings = readUint32(bytes, 44)

        return {
            name: entry.filename,
            startTime: new Date(startTime * 1000),
            duration: duration,
            numberOfPings
        }
    }

}
