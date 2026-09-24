import { DefaultListenable } from "../../domain/listenable/listenable";
import type { RecordingService, RecordingServiceEvents } from "../../domain/recording/RecordingService";
import type { RecordingRepository } from "../repositories/recording-repository";

export class BrowserRecordingService extends DefaultListenable<RecordingServiceEvents> implements RecordingService {
    
    private readonly _recordingRepository: RecordingRepository
    
    // Input for opening recordings
    private _zipFileInput!: HTMLInputElement

    constructor(recordingRepository: RecordingRepository) {
        super()
        this._recordingRepository = recordingRepository
        this.createFileInput()

        this._recordingRepository.addWildcardListener((event, data) => {
            this.publishEvent(event, data)
        })
    }

    isOpenDirectorySupported(): boolean {
        return false
    }
    
    isOpenZipSupported(): boolean {
        return true
    }
    
    openDirectory(): void {
        throw new Error("Opening directories not supported.");
    }
    
    openZip(): void {
        this._zipFileInput.click()
    }

    // =================================
    // MARK: File input
    // =================================

    private createFileInput() {
        this._zipFileInput = document.createElement("input")
        this._zipFileInput.type = "file"
        this._zipFileInput.addEventListener("change", this.handleZipFileInputChange.bind(this))
    }

    private handleZipFileInputChange() {
        const files = this._zipFileInput.files

        if (!files || files.length < 1) {
            this.publishEvent("error", {
                type: "zip",
                error: "No file provided"
            })
            return
        }

        this._recordingRepository.openZip(files[0])
    }

}
