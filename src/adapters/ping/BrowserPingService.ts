import type { Ping } from "../../domain/ping/Ping";
import type { BeamId, PingService } from "../../domain/ping/PingService";
import type { Recording } from "../../domain/recording/Recording";
import type { ZipFileHolder } from "../ZipFileHolder";
import { EntryReader } from "../EntryReader";

const BEAM_FILE_NAMES: Record<BeamId, string> = {
    "side-scan-port": "B002.SON",
    "side-scan-starboard": "B003.SON"
} as const

type PingMetadata = {
    timeElapsed: number,
    headerOffset: number
}

export class BrowserPingService implements PingService {

    private zipFileHolder: ZipFileHolder

    /**
     * Index for quickly navigating the SON file.
     * 
     * The sonar builds an index file itself (the IDX file). However, this file
     * does not contain information about the elapsed time (which is the basement for
     * loading pings in this implementation). So we are building the index ourself.
     */
    private pingIndex = new Map<Recording, Map<BeamId, PingMetadata[]>>

    constructor(zipFileHolder: ZipFileHolder) {
        this.zipFileHolder = zipFileHolder
    }

    /**
     * Constructs an index with one ping every second. Only holds minimal information about the ping.
     */
    async createPingIndex(recording: Recording, beam: BeamId): Promise<void> {
        console.log(`Start creating ping index for recording '${recording.name}' and beam '${beam}'.`)
        const startTime = Date.now()

        const beamFile = await this.getBeamFile(recording, beam)

        const [firstPing, secondHeaderOffset] = this.loadPingHeader(0, beamFile)

        const pings = [firstPing]
        let offset = secondHeaderOffset
        let lastRecordedPing = firstPing

        const fileLength = beamFile.size()
        while (offset < fileLength) {
            const [nextPing, pingSize] = this.loadPingHeader(offset, beamFile)

            if (nextPing.timeElapsed >= lastRecordedPing.timeElapsed + 1000) {
                pings.push(nextPing)
                lastRecordedPing = nextPing
            }

            offset += pingSize
        }

        this.insertPingIndex(recording, beam, pings)

        console.log(`Finished creating ping index for recording '${recording.name}' and beam '${beam}'. Contains ${pings.length} pings. Took ${Date.now() - startTime}ms.`)
    }

    async loadPings(recording: Recording, beam: BeamId, beginTime: number, endTime: number): Promise<Ping[]> {
        console.log(`Started loading pings for recording '${recording.name}' and beam '${beam}'.`)
        const startTime = Date.now()
        
        const beamFile = await this.getBeamFile(recording, beam)

        const pings: Ping[] = []
        let offset = 0;

        const fileLength = beamFile.size()
        
        while (offset < fileLength) {
            const [ping, size] = await this.loadPing(offset, beamFile)
            if (ping.timeElapsed >= beginTime && ping.timeElapsed <= endTime) {
                pings.push(ping)
            }
            offset += size
        }

        console.log(`Finished loading pings for recording '${recording.name}' and beam '${beam}'. Contains ${pings.length} pings. Took ${Date.now() - startTime}ms.`)

        return pings
    }

    private async getBeamFile(recording: Recording, beam: BeamId) {
        const zipFile = this.zipFileHolder.zipFile
        
        if (!zipFile) {
            throw new Error("No zip file present!")
        }

        // Determine beam file name
        const folderName = recording.name.substring(0, recording.name.length - 4)
        const beamFileName = folderName + "/" + BEAM_FILE_NAMES[beam]

        // Find beam file in zip
        const entries = zipFile.getEntries()
        const beamFile = entries.find(e => e.filename === beamFileName)

        if (!beamFile || beamFile.directory) {
            throw new Error("Beam file not found: " + beamFileName)
        }

        // Return corresponding entry reader
        return await zipFile.getEntryReader(beamFile)
    }

    private loadPingHeader(headerOffset: number, entry: EntryReader): [PingMetadata, number] {
        const headerMagicNumber = entry.readUInt32(headerOffset);

        if (headerMagicNumber !== 0x21ABDEC0) {
            throw new Error("Header does not start with expected magic number at offset " + headerOffset)
        }

        const timeElapsed = entry.readUInt32LE(headerOffset + 10)
        const numberOfReturns = entry.readUInt32LE(headerOffset + 147)

        return [
            {
                timeElapsed,
                headerOffset
            },
            numberOfReturns + 152
        ]
    }

    private loadPing(headerOffset: number, entry: EntryReader): [Ping, number] {
        const headerMagicNumber = entry.readUInt32(headerOffset);

        if (headerMagicNumber !== 0x21ABDEC0) {
            throw new Error("Header does not start with expected magic number at offset " + headerOffset)
        }

        const numberOfReturns = entry.readUInt32LE(headerOffset + 147)
        const recordNumber = entry.readUInt32LE(headerOffset + 5)
        const timeElapsed = entry.readUInt32LE(headerOffset + 10)

        const returns = entry.slice(headerOffset + 152, headerOffset + 152 + numberOfReturns)

        return [
            {
                recordNumber: recordNumber,
                numberOfReturns: numberOfReturns,
                soundReturns: returns,
                timeElapsed
            },
            numberOfReturns + 152
        ]
    }

    private insertPingIndex(recording: Recording, beam: BeamId, pings: PingMetadata[]) {
        if (!this.pingIndex.has(recording)) {
            this.pingIndex.set(recording, new Map());
        }
        this.pingIndex.get(recording)!.set(beam, pings)
    }

}
