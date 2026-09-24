import { DefaultListenable } from "../../domain/listenable/listenable";
import type { RecordingServiceEvents } from "../../domain/recording/RecordingService";
import { type SonarViewerInvocableObjects, WorkerInvoker } from "../worker/messages";
import type { RecordingRepository } from "./recording-repository";

export class WorkerRecordingRepository extends DefaultListenable<RecordingServiceEvents> implements RecordingRepository {

    private readonly _workerInvoker: WorkerInvoker<SonarViewerInvocableObjects>

    constructor(workerInvoker: WorkerInvoker<SonarViewerInvocableObjects>) {
        super()
        this._workerInvoker = workerInvoker

        this._workerInvoker.listenable("recordingRepository").addWildcardListener((e, d) => this.publishEvent(e, d))
    }
    
    openZip(zipFile: File): void {
        this._workerInvoker.call("recordingRepository", "openZip", zipFile)
    }
    
    openFolder(files: File[]): void {
        this._workerInvoker.call("recordingRepository", "openFolder", files)
    }

}
