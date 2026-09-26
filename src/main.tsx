import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './ui/app/App.tsx'
import { BrowserRecordingService } from './adapters/services/browser-recording-service.ts'
import { ServicesProvider, type Services } from './domain/Services.tsx'
import { BrowserPingService } from './adapters/services/BrowserPingService.ts'
import "./index.css"
import SonarWorker from "./adapters/worker/Worker.ts?worker"
import { type SonarViewerInvocableObjects, WorkerInvoker } from './adapters/worker/messages.ts'
import { WorkerRecordingRepository } from './adapters/repositories/worker-recording-repository.ts'
import { WorkerPingRepository } from './adapters/repositories/worker-ping-reposiotry.ts'
import "material-symbols"

/*
const zipFileHolder = new ZipFileHolder()

const recordingRepository = new DefaultRecordingRepository(zipFileHolder)
const pingRepository = new DefaultPingRepository(zipFileHolder)
*/

const worker = new SonarWorker()
const workerInvoker = new WorkerInvoker<SonarViewerInvocableObjects>(worker)

const recordingRepository = new WorkerRecordingRepository(workerInvoker)
const pingRepository = new WorkerPingRepository(workerInvoker)

const recordingService = new BrowserRecordingService(recordingRepository)
const pingService = new BrowserPingService(pingRepository)


const services: Services = {
  recordingService,
  pingService
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ServicesProvider services={services}>
      <App />
    </ServicesProvider>
  </StrictMode>,
)
