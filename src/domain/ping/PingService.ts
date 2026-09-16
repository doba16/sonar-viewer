import type { Recording } from "../recording/Recording"
import type { BoatPosition, Coordinate } from "./Ping"

export type BeamId = "side-scan-port" | "side-scan-starboard"

export type SonarView = "side-scan" | "down-imaging" | "2d"

export interface PingService {
    
    createPingIndex(recording: Recording, beam: BeamId): Promise<void>

    renderPings(recording: Recording, timeAtCenter: number, timeFrame: number, canvas: HTMLCanvasElement, width: number, height: number): Promise<void>

    findCoordinates(recording: Recording): Promise<Coordinate[]>

    findCoordinateAt(recording: Recording, time: number): Promise<BoatPosition>

}
