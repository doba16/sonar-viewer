import { BlobReader, ZipReader, type FileEntry } from "@zip.js/zip.js";
import type { Recording, Recordings } from "../../domain/recording/Recording";
import type { RecordingService } from "../../domain/recording/RecordingService";
import type { ZipFileHolder } from "../ZipFileHolder";
import { ZipFile } from "../ZipFile";

export class BrowserRecordingService implements RecordingService {

    private zipFileHolder: ZipFileHolder

    private inputElement: HTMLInputElement

    private recordingsOpenedCallback?: (recordings: Recordings) => void

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

    setRecordingsOpenedCallback(callback: (recordings: Recordings) => void): void {
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
            const zipFile = await this.createZipFile(inputFile)
            this.zipFileHolder.zipFile = zipFile

            const recordingsList = await this.findRecordings(zipFile)

            const recordings: Recordings = {
                recordings: recordingsList,
                type: "zip",
                filepath: inputFile.name
            }

            this.recordingsOpenedCallback?.(recordings)
        } catch (e) {
            console.log(e)
            alert("Could not read zip file!")
        }
    }

    private async createZipFile(file: File): Promise<ZipFile> {
        const blob = new Blob([file], { type: file.type })
        const blobReader = new BlobReader(blob)
        const zipReader = new ZipReader(blobReader)
        return await ZipFile.fromZipReader(zipReader)
    }

    private async findRecordings(zipFile: ZipFile): Promise<Recording[]> {
        const entries = zipFile.getEntries()
        
        const recs: Recording[] = []
    
        for (const entry of entries) {
            if (entry.directory) continue
    
            if (entry.filename.toLowerCase().endsWith(".dat")) {
                recs.push(await this.readDatEntry(zipFile, entry))
            }
        }
    
        return recs
    }

    private async readDatEntry(zipFile: ZipFile, entry: FileEntry): Promise<Recording> {
        const entryReader = await zipFile.getEntryReader(entry)
        const startTime = entryReader.readUInt32(20)
        const duration = entryReader.readUInt32(48)
        const numberOfPings = entryReader.readUInt32(44)

        return {
            name: entry.filename,
            startTime: new Date(startTime * 1000),
            duration: duration,
            numberOfPings
        }
    }

}
