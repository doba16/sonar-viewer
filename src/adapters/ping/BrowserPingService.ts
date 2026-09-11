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

type Ping = {
    timeElapsed: number,
    returnCount: number,
    /* Offset of first return in ping file */
    returnsBegin: number, 
    /* Offset of last return in ping file */
    returnsEnd: number
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

        const [firstPing, secondHeaderOffset] = this.loadPingMetadata(0, beamFile)

        const pings = [firstPing]
        let offset = secondHeaderOffset
        let lastRecordedPing = firstPing

        const fileLength = beamFile.size()
        while (offset < fileLength) {
            const [nextPing, pingSize] = this.loadPingMetadata(offset, beamFile)

            if (nextPing.timeElapsed >= lastRecordedPing.timeElapsed + 1000) {
                pings.push(nextPing)
                lastRecordedPing = nextPing
            }

            offset += pingSize
        }

        this.insertPingIndex(recording, beam, pings)

        console.log(`Finished creating ping index for recording '${recording.name}' and beam '${beam}'. Contains ${pings.length} pings. Took ${Date.now() - startTime}ms.`)
    }

    async renderPings(recording: Recording, beam: BeamId, timeAtCenter: number, timeFrame: number, canvas: HTMLCanvasElement): Promise<void> {
        const beamFile = await this.getBeamFile(recording, beam)

        const timeFrameStart = timeAtCenter - timeFrame / 2.0
        const timeFrameEnd = timeAtCenter + timeFrame / 2.0

        const pings = this.loadPings(beamFile, timeFrameStart, timeFrameEnd)
        this.renderPingArray(pings, canvas, beamFile)
    }

    private loadPings(beamFile: EntryReader, timeFrameStart: number, timeFrameEnd: number): Ping[] {
        const fileLength = beamFile.size()
        
        const pings: Ping[] = []
        let offset = 0;
        
        // TODO use ping index
        while (offset < fileLength) {
            const [ping, size] = this.loadPing(offset, beamFile)
            if (ping.timeElapsed >= timeFrameStart && ping.timeElapsed <= timeFrameEnd) {
                pings.push(ping)
            }
            offset += size
        }

        return pings
    }

    private renderPingArray(pings: Ping[], canvas: HTMLCanvasElement, pingFile: EntryReader) {
        // Get maximum number of returns
        const maxReturnCount = pings.reduce((p, c) => Math.max(p, c.returnCount), 0)

        // Clear original canvas
        const canvasGraphicsContext = canvas.getContext("2d")
        
        if (!canvasGraphicsContext) {
            throw new Error("Could not get graphics context")
        }

        canvasGraphicsContext.fillStyle = "black"
        canvasGraphicsContext.fillRect(0, 0, canvas.width, canvas.height)

        // Only render pings when there are pings to render
        if (pings.length < 10) {
            return
        }

        // Prepare canvas
        const pingsOnlyCanvas = new OffscreenCanvas(maxReturnCount, pings.length)
        const graphicsContext = pingsOnlyCanvas.getContext("2d")

        if (!graphicsContext) {
            throw new Error("Could not get graphics context")
        }

        // Clear canvas
        graphicsContext.fillStyle = "black"
        graphicsContext.fillRect(0, 0, pingsOnlyCanvas.width, pingsOnlyCanvas.height)

        console.log(pingsOnlyCanvas.width, pingsOnlyCanvas.height)

        const imageData = graphicsContext.getImageData(0, 0, pingsOnlyCanvas.width, pingsOnlyCanvas.height)

        // TODO This does not take actual time position of ping into account. All pings are considered to take equally long.
        for (let t = 0; t < pings.length; t++) {
            const ping = pings[t]
            for (let x = 0; x < ping.returnCount; x++) {
                imageData.data[(t * imageData.width + x) * 4] = pingFile.readUInt8(ping.returnsBegin + x)
                imageData.data[(t * imageData.width + x) * 4 + 1] = pingFile.readUInt8(ping.returnsBegin + x)
                imageData.data[(t * imageData.width + x) * 4 + 2] = pingFile.readUInt8(ping.returnsBegin + x)
            }
        }

        graphicsContext.putImageData(imageData, 0, 0)

        canvasGraphicsContext.drawImage(pingsOnlyCanvas, 0, 0, canvas.width, canvas.height)
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

    /**
     * Loads minimal metadata about a ping.
     * @param headerOffset Offset in the pings file where the ping header starts
     * @param entry File to read the ping from
     * @returns Minimal metadata about the ping and the total ping size in bytes including header
     */
    private loadPingMetadata(headerOffset: number, entry: EntryReader): [PingMetadata, number] {
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

    /**
     * Loads a single ping from the pings file.
     * @param headerOffset Offset in the pings file where the ping header begins
     * @param entry File to load the pings from
     * @returns The ping that was read from the pings file and the total size of the ping in bytes including header
     * @throws If the ping header at the given offset does not start with the correct magic number
     */
    private loadPing(headerOffset: number, entry: EntryReader): [Ping, number] {
        const [pingMetadata] = this.loadPingMetadata(headerOffset, entry)

        const numberOfReturns = entry.readUInt32LE(headerOffset + 147)

        return [
            {
                timeElapsed: pingMetadata.timeElapsed,
                returnCount: numberOfReturns,
                returnsBegin: headerOffset + 152,
                returnsEnd: headerOffset + 151 + numberOfReturns
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
