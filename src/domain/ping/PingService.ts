import type { Recording } from "../recording/Recording"
import type { Ping } from "./Ping"

export type BeamId = "side-scan-port" | "side-scan-starboard"

export interface PingService {
    
    loadPings(recording: Recording, beam: BeamId): Promise<Ping[]>

}