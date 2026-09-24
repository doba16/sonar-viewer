import type { Listenable } from "../listenable/listenable";
import type { Recordings } from "./Recording";

export type OpenType = "folder" | "zip"

export type RecordingServiceEvents = {
    "opening": {
        type: OpenType
    },
    "error": {
        type: OpenType,
        error: unknown
    },
    "success": {
        type: OpenType,
        recordings: Recordings
    }
}

export interface RecordingService extends Listenable<RecordingServiceEvents> {
    
    /**
     * Whether this RecordingService supports opening directories.
     */
    isOpenDirectorySupported(): boolean

    /**
     * Whether this RecordingService supports opening zip files.
     */
    isOpenZipSupported(): boolean

    /**
     * Open all recordings from a directory.
     */
    openDirectory(): void

    /**
     * Open all recordings from a zip file.
     */
    openZip(): void

}
