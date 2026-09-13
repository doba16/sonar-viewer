import type { Recordings } from "./Recording";

export interface RecordingService {
    
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

    /**
     * Sets the callback to call when recordings are opened.
     * @param callback the function to call
     */
    setRecordingsOpenedCallback(callback: (recordings: Recordings) => void): void

    /**
     * Removes the callback.
     */
    clearRecordingsService(): void;

}
