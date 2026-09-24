import type { Listenable } from "../../domain/listenable/listenable"
import type { RecordingServiceEvents } from "../../domain/recording/RecordingService"

/**
 * Repository for opening recordings from a folder or a zip file.
 */
export interface RecordingRepository extends Listenable<RecordingServiceEvents> {
    
    /**
     * Open recordings from a zip file.
     * @param zipFile zip file to open
     */
    openZip(zipFile: File): void

    /**
     * Opens recordings from an uncompressed folder.
     * @param files files contained in the folder
     */
    openFolder(files: File[]): void

}
