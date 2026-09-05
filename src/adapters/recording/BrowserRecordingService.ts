import { BlobReader, ZipReader, type FileEntry } from "@zip.js/zip.js";
import type { Recording } from "../../domain/recording/Recording";
import type { RecordingService } from "../../domain/recording/RecordingService";
import type { ZipFileHolder } from "../ZipFileHolder";
import { EntryReader } from "../EntryReader";

export class BrowserRecordingService implements RecordingService {

    private zipFileHolder: ZipFileHolder

    private inputElement: HTMLInputElement

    private recordingsOpenedCallback?: (recordings: Recording[]) => void

    constructor(zipFileHolder: ZipFileHolder) {
        this.zipFileHolder = zipFileHolder

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
            const zipFile = this.createZipReader(inputFile)
            this.zipFileHolder.zipFile = zipFile

            const recordings = await this.findRecordings()
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

    private async findRecordings(): Promise<Recording[]> {
        const entries = await this.zipFileHolder.getEntries()
        
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
        const entryReader = new EntryReader(entry)
        const startTime = await entryReader.readUInt32(20)
        const duration = await entryReader.readUInt32(48)
        const numberOfPings = await entryReader.readUInt32(44)

        return {
            name: entry.filename,
            startTime: new Date(startTime * 1000),
            duration: duration,
            numberOfPings
        }
    }

}
