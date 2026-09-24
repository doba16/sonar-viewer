import type { BoatPosition, Coordinate } from "../../domain/ping/Ping"
import type { BeamId } from "../../domain/ping/PingService"
import type { Recording } from "../../domain/recording/Recording"

export interface PingRepository {
    
    createPingIndex(recording: Recording, beam: BeamId): Promise<void>
    
    renderPings(recording: Recording, timeAtCenter: number, timeFrame: number, width: number, height: number): Promise<ImageBitmap>

    findCoordinates(recording: Recording): Promise<Coordinate[]>

    findCoordinateAt(recording: Recording, time: number): Promise<BoatPosition>

}