import type { FileEntry } from "@zip.js/zip.js";
import type { Ping } from "../../domain/ping/Ping";
import type { BeamId, PingService } from "../../domain/ping/PingService";
import type { Recording } from "../../domain/recording/Recording";
import type { ZipFileHolder } from "../ZipFileHolder";
import { EntryReader } from "../EntryReader";

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
        const beamFile = await this.getFileEntry(recording, beam)
        const entryReader = new EntryReader(beamFile)

        const pings: Ping[] = []
        let offset = 0;

        const fileLength = await entryReader.size()
        
        while (offset < fileLength) {
            const [ping, size] = await this.loadPing(offset, entryReader)
            pings.push(ping)
            offset += size
        }

        return pings
    }


    private async loadPing(headerOffset: number, entry: EntryReader): Promise<[Ping, number]> {
        const headerMagicNumber = await entry.readUInt32(headerOffset);

        if (headerMagicNumber !== 0x21ABDEC0) {
            throw new Error("Header does not start with expected magic number at offset " + headerOffset)
        }

        const numberOfReturns = await entry.readUInt32LE(headerOffset + 147)
        const recordNumber = await entry.readUInt32LE(headerOffset + 5)

        const returns = await entry.slice(headerOffset + 152, headerOffset + 152 + numberOfReturns)

        return [
            {
                recordNumber: recordNumber,
                numberOfReturns: numberOfReturns,
                soundReturns: returns
            },
            numberOfReturns + 152
        ]
    }

    private async getFileEntry(recording: Recording, beam: BeamId): Promise<FileEntry> {
        const folderName = recording.name.substring(0, recording.name.length - 4)
        const beamFileName = folderName + "/" + BEAM_FILE_NAMES[beam]

        const entries = await this.zipFileHolder.getEntries()
        const beamFile = entries.find(e => e.filename === beamFileName)

        if (!beamFile || beamFile.directory) {
            throw new Error("Beam file not found: " + beamFileName)
        }

        return beamFile
    }

}