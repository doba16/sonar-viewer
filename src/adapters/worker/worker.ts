/// <reference lib="webworker" />

import { DefaultPingRepository } from "../repositories/default-ping-repository"
import { DefaultRecordingRepository } from "../repositories/default-recording-repository"
import { ZipFileHolder } from "../storage/zip-file-holder"
import type { SonarViewerInvocableObjects } from "./messages"
import { setupWorkerMessaging } from "./messages-worker"

const zipFileHolder = new ZipFileHolder()

const pingRepository = new DefaultPingRepository(zipFileHolder)
const recordingRepository = new DefaultRecordingRepository(zipFileHolder)

setupWorkerMessaging<SonarViewerInvocableObjects>({
	pingRepository: pingRepository,
	recordingRepository: recordingRepository
})
