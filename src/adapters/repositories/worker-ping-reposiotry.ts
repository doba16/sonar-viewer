import type { Coordinate, BoatPosition } from "../../domain/ping/Ping";
import type { BeamId } from "../../domain/ping/PingService";
import type { Recording } from "../../domain/recording/Recording";
import type { SonarViewerInvocableObjects, WorkerInvoker } from "../worker/messages";
import type { PingRepository } from "./ping-repository";

export class WorkerPingRepository implements PingRepository {
    
    private readonly _workerInvoker: WorkerInvoker<SonarViewerInvocableObjects>
    
    constructor(workerInvoker: WorkerInvoker<SonarViewerInvocableObjects>) {
        this._workerInvoker = workerInvoker
    }

    createPingIndex(recording: Recording, beam: BeamId): Promise<void> {
        return this._workerInvoker.call("pingRepository", "createPingIndex", recording, beam)
    }
    
    renderPings(recording: Recording, timeAtCenter: number, timeFrame: number, width: number, height: number): Promise<ImageBitmap> {
        return this._workerInvoker.call("pingRepository", "renderPings", recording, timeAtCenter, timeFrame, width, height)
    }
    
    findCoordinates(recording: Recording): Promise<Coordinate[]> {
        return this._workerInvoker.call("pingRepository", "findCoordinates", recording)
    }
    
    findCoordinateAt(recording: Recording, time: number): Promise<BoatPosition> {
        return this._workerInvoker.call("pingRepository", "findCoordinateAt", recording, time)
    }
    
}