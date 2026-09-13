import type { Recording } from "../recording/Recording"

export type BeamId = "side-scan-port" | "side-scan-starboard"

export type SonarView = "side-scan" | "down-imaging" | "2d"

export interface PingService {
    
    createPingIndex(recording: Recording, beam: BeamId): Promise<void>

    renderPings(recording: Recording, beam: BeamId, timeAtCenter: number, timeFrame: number, canvas: HTMLCanvasElement, width: number, height: number): Promise<void>

}
