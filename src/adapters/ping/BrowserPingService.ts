import type { FileEntry } from "@zip.js/zip.js";
import type { Ping } from "../../domain/ping/Ping";
import type { BeamId, PingService } from "../../domain/ping/PingService";
import type { Recording } from "../../domain/recording/Recording";
import type { ZipFileHolder } from "../ZipFileHolder";
import { EntryReader } from "../EntryReader";
import type { ZipFile } from "../ZipFile";

const BEAM_FILE_NAMES: Record<BeamId, string> = {
    "side-scan-port": "B002.SON",
    "side-scan-starboard": "B003.SON"
} as const

export class BrowserPingService implements PingService {

    private zipFileHolder: ZipFileHolder

    constructor(zipFileHolder: ZipFileHolder) {
        this.zipFileHolder = zipFileHolder
    }

    async loadPings(recording: Recording, beam: BeamId): Promise<Ping[]> {
        const zipFile = this.zipFileHolder.zipFile
        
        if (!zipFile) {
            throw new Error("No zip file present!")
        }

        const beamFileEntry = this.getFileEntry(zipFile, recording, beam)
        const beamFile = await zipFile.getEntryReader(beamFileEntry)

        const pings: Ping[] = []
        let offset = 0;

        const fileLength = beamFile.size()
        
        while (offset < fileLength) {
            const [ping, size] = await this.loadPing(offset, beamFile)
            pings.push(ping)
            offset += size
        }

        return pings
    }


    private async loadPing(headerOffset: number, entry: EntryReader): Promise<[Ping, number]> {
        const headerMagicNumber = entry.readUInt32(headerOffset);

        if (headerMagicNumber !== 0x21ABDEC0) {
            throw new Error("Header does not start with expected magic number at offset " + headerOffset)
        }

        const numberOfReturns = entry.readUInt32LE(headerOffset + 147)
        const recordNumber = entry.readUInt32LE(headerOffset + 5)

        const returns = entry.slice(headerOffset + 152, headerOffset + 152 + numberOfReturns)

        return [
            {
                recordNumber: recordNumber,
                numberOfReturns: numberOfReturns,
                soundReturns: returns
            },
            numberOfReturns + 152
        ]
    }

    private getFileEntry(zipFile: ZipFile, recording: Recording, beam: BeamId): FileEntry {
        const folderName = recording.name.substring(0, recording.name.length - 4)
        const beamFileName = folderName + "/" + BEAM_FILE_NAMES[beam]

        const entries = zipFile.getEntries()
        const beamFile = entries.find(e => e.filename === beamFileName)

        if (!beamFile || beamFile.directory) {
            throw new Error("Beam file not found: " + beamFileName)
        }

        return beamFile
    }

}