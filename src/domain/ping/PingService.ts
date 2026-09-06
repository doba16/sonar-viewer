import type { Recording } from "../recording/Recording"
import type { Ping } from "./Ping"

export type BeamId = "side-scan-port" | "side-scan-starboard"

export interface PingService {
    
    createPingIndex(recording: Recording, beam: BeamId): Promise<void>

    loadPings(recording: Recording, beam: BeamId, beginTime: number, endTime: number): Promise<Ping[]>

}
