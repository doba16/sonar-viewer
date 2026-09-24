import { BlobReader, ZipReader, type FileEntry } from "@zip.js/zip.js"
import { burnCpu } from "../../burn-cpu"
import type { RecordingServiceEvents } from "../../domain/recording/RecordingService"
import { ZipFile } from "../storage/ZipFile"
import { ZipFileHolder } from "../storage/ZipFileHolder"
import type { RecordingRepository } from "./recording-repository"
import type { Recording, Recordings } from "../../domain/recording/Recording"
import { DefaultListenable } from "../../domain/listenable/listenable"

export class DefaultRecordingRepository extends DefaultListenable<RecordingServiceEvents> implements RecordingRepository {

    private _zipFileHolder: ZipFileHolder

    constructor(zipFileHolder: ZipFileHolder) {
        super()
        this._zipFileHolder = zipFileHolder
    }

    async openZip(importZipFile: File) {
        // Report status
        this.publishEvent("opening", {
            type: "zip"
        })

        burnCpu(2000)

        // Read zip file
        try {
            const zipFile = await this.createZipFile(importZipFile)
            this._zipFileHolder.zipFile = zipFile

            const recordingsList = await this.findRecordings(zipFile)

            const recordings: Recordings = {
                recordings: recordingsList,
                type: "zip",
                filepath: importZipFile.name
            }

            this.publishEvent("success", {
                type: "zip",
                recordings: recordings
            })
        } catch (e) {
            console.log(e)
            this.publishEvent("error", {
                type: "zip",
                error: e
            })
        }
    }

    openFolder(_: File[]): void {
        throw Error("Opening folders not implemented yet.")
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

        const coordinateEasting = entryReader.readUInt32(24)
        const coordinateNorthing = entryReader.readUInt32(28)

        return {
            name: entry.filename,
            startTime: new Date(startTime * 1000),
            duration: duration,
            numberOfPings,
            coordinate: {
                easting: coordinateEasting,
                northing: coordinateNorthing
            }
        }
    }

}
