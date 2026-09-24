import type { BeamId, PingService } from "../../domain/ping/PingService";
import type { Recording } from "../../domain/recording/Recording";
import type { BoatPosition, Coordinate } from "../../domain/ping/Ping";
import type { PingRepository } from "../repositories/ping-repository";

export class BrowserPingService implements PingService {
    
    private _pingRepository: PingRepository

    constructor(pingRepository: PingRepository) {
        this._pingRepository = pingRepository
    }

    createPingIndex(recording: Recording, beam: BeamId): Promise<void> {
        return this._pingRepository.createPingIndex(recording, beam)
    }
    
    async renderPings(recording: Recording, timeAtCenter: number, timeFrame: number, canvas: HTMLCanvasElement, width: number, height: number): Promise<void> {
        const sonarView = await this._pingRepository.renderPings(recording, timeAtCenter, timeFrame, width, height)
        
        canvas.width = width
        canvas.height = height

        const canvasCtx = canvas.getContext("2d")
        if (!canvasCtx) return

        canvasCtx.drawImage(sonarView, 0, 0,)
    }
    
    findCoordinates(recording: Recording): Promise<Coordinate[]> {
        return this._pingRepository.findCoordinates(recording)
    }
    
    findCoordinateAt(recording: Recording, time: number): Promise<BoatPosition> {
        return this._pingRepository.findCoordinateAt(recording, time)
    }
}
