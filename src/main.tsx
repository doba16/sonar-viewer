import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserPingService } from "./adapters/services/browser-ping-service.ts"
import { BrowserRecordingService } from "./adapters/services/browser-recording-service.ts"
import { type Services, ServicesProvider } from "./domain/services.tsx"
import App from "./ui/app/app.tsx"
import "./index.css"
import { WorkerPingRepository } from "./adapters/repositories/worker-ping-reposiotry.ts"
import { WorkerRecordingRepository } from "./adapters/repositories/worker-recording-repository.ts"
import { type SonarViewerInvocableObjects, WorkerInvoker } from "./adapters/worker/messages.ts"
import SonarWorker from "./adapters/worker/worker.ts?worker"
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

const renderRoot = document.getElementById("root")

if (renderRoot === null) {
	throw "Failed to load app."
}

createRoot(renderRoot).render(
	<StrictMode>
		<ServicesProvider services={services}>
			<App />
		</ServicesProvider>
	</StrictMode>
)
