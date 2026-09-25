import { burnCpu } from "../../burn-cpu";
import type { BoatPosition, Coordinate } from "../../domain/ping/Ping";
import type { BeamId } from "../../domain/ping/PingService";
import type { Recording } from "../../domain/recording/Recording";
import type { EntryReader } from "../storage/EntryReader";
import type { ZipFileHolder } from "../storage/ZipFileHolder";
import type { PingRepository } from "./ping-repository";

const BEAM_FILE_NAMES: Record<BeamId, string> = {
    "side-scan-port": "B002.SON",
    "side-scan-starboard": "B003.SON"
} as const

type PingMetadata = {
    timeElapsed: number,
    headerOffset: number
}

type Ping = {
    heading: number;
    timeElapsed: number,
    returnCount: number,
    /* Offset of first return in ping file */
    returnsBegin: number, 
    /* Offset of last return in ping file */
    returnsEnd: number,
    // TODO extract into other type for not loading coordinates when only interested in pings
    coordinateEasting: number,
    coordinateNorthing: number
}

export class DefaultPingRepository implements PingRepository {
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

    async renderPings(recording: Recording, timeAtCenter: number, timeFrame: number, width: number, height: number): Promise<ImageBitmap> {
        // Viewport that will be rendered to the screen
        // Must be at least 1px x 1px to be able to transfer it to ImageBitmap
        const viewerCanvas = new OffscreenCanvas(Math.max(width, 1), Math.max(height, 1))
        const viewerCanvasCtx = viewerCanvas.getContext("2d")

        if (!viewerCanvasCtx) {
            return viewerCanvas.transferToImageBitmap()
        }

        viewerCanvasCtx.fillStyle = "black"
        viewerCanvasCtx.fillRect(0, 0, viewerCanvas.width, viewerCanvas.height)
        
        // Do not draw if canvas is too small
        if (width <= 0 || height <= 0) {
            return viewerCanvas.transferToImageBitmap()
        }
        
        const portBeamFile = await this.getBeamFile(recording, "side-scan-port")
        const starboardBeamFile = await this.getBeamFile(recording, "side-scan-starboard")

        burnCpu(500)

        const timeFrameStart = timeAtCenter - timeFrame / 2.0
        const timeFrameEnd = timeAtCenter + timeFrame / 2.0

        const pingsPort = this.loadPings(portBeamFile, timeFrameStart, timeFrameEnd)
        const pingsStarboard = this.loadPings(starboardBeamFile, timeFrameStart, timeFrameEnd)
        
        // Get maximum number of returns
        const maxPortReturnCount = pingsPort.reduce((p, c) => Math.max(p, c.returnCount), 0)
        const maxStarboardReturnCount = pingsStarboard.reduce((p, c) => Math.max(p, c.returnCount), 0)
        const maxReturnCount = Math.max(maxPortReturnCount, maxStarboardReturnCount)

        // Only render pings when there are pings to render
        const pingsCount = Math.max(pingsPort.length, pingsStarboard.length)
        if (pingsCount > 10) {

            // Prepare canvas
            const pingsOnlyCanvas = new OffscreenCanvas(maxReturnCount * 2, pingsCount)
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
            // Starboard
            for (let t = 0; t < pingsStarboard.length; t++) {
                const ping = pingsStarboard[t]
                for (let x = 0; x < ping.returnCount; x++) {
                    imageData.data[(t * imageData.width + (x + maxReturnCount)) * 4] = starboardBeamFile.readUInt8(ping.returnsBegin + x)
                    imageData.data[(t * imageData.width + (x + maxReturnCount)) * 4 + 1] = starboardBeamFile.readUInt8(ping.returnsBegin + x)
                    imageData.data[(t * imageData.width + (x + maxReturnCount)) * 4 + 2] = starboardBeamFile.readUInt8(ping.returnsBegin + x)
                }
            }
            // Port
            for (let t = 0; t < pingsStarboard.length; t++) {
                const ping = pingsStarboard[t]
                for (let x = 0; x < ping.returnCount; x++) {
                    imageData.data[(t * imageData.width + (maxReturnCount - x)) * 4] = portBeamFile.readUInt8(ping.returnsBegin + x)
                    imageData.data[(t * imageData.width + (maxReturnCount - x)) * 4 + 1] = portBeamFile.readUInt8(ping.returnsBegin + x)
                    imageData.data[(t * imageData.width + (maxReturnCount - x)) * 4 + 2] = portBeamFile.readUInt8(ping.returnsBegin + x)
                }
            }

            graphicsContext.putImageData(imageData, 0, 0)

            viewerCanvasCtx.drawImage(pingsOnlyCanvas, 0, 0, width, height)
        }

        // TODO draw boat icon here...

        return viewerCanvas.transferToImageBitmap()
    }

    async findCoordinates(recording: Recording): Promise<Coordinate[]> {
        const beamFile = await this.getBeamFile(recording, "side-scan-port")
        const pings = this.loadPings(beamFile, 0, Infinity)

        const coordinates: Coordinate[] = []
        let lastPing = pings[0]
        coordinates.push({
            easting: lastPing.coordinateEasting,
            northing: lastPing.coordinateNorthing
        })

        for (let ping of pings) {
            if (lastPing.coordinateEasting != ping.coordinateEasting || lastPing.coordinateNorthing != ping.coordinateNorthing) {
                coordinates.push({
                    easting: lastPing.coordinateEasting,
                    northing: lastPing.coordinateNorthing
                })
            }
            lastPing = ping
        }

        return coordinates
    }

    async findCoordinateAt(recording: Recording, time: number): Promise<BoatPosition> {
        const beamFile = await this.getBeamFile(recording, "side-scan-port")
        const pings = this.loadPings(beamFile, 0, Infinity)

        burnCpu(500)

        for (let ping of pings) {
            if (ping.timeElapsed > time) {
                return {
                    coordinate: {
                        easting: ping.coordinateEasting,
                        northing: ping.coordinateNorthing
                    },
                    heading: ping.heading
                }
            }
        }

        const ping = pings[pings.length - 1]
        return {
            coordinate: {
                easting: ping.coordinateEasting,
                northing: ping.coordinateNorthing
            },
            heading: ping.heading
        }
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

        const easting = entry.readUInt32LE(headerOffset + 15)
        const northing = entry.readUInt32LE(headerOffset + 20)
        const heading = entry.readUInt16LE(headerOffset + 27) / 10

        return [
            {
                timeElapsed: pingMetadata.timeElapsed,
                returnCount: numberOfReturns,
                returnsBegin: headerOffset + 152,
                returnsEnd: headerOffset + 151 + numberOfReturns,
                coordinateEasting: easting,
                coordinateNorthing: northing,
                heading: heading
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