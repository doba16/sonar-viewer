import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './ui/app/App.tsx'
import { BrowserRecordingService } from './adapters/recording/BrowserRecordingService.ts'
import { ServicesProvider, type Services } from './domain/Services.tsx'
import { ZipFileHolder } from './adapters/ZipFileHolder.ts'
import { BrowserPingService } from './adapters/ping/BrowserPingService.ts'
import "./index.css"

const zipFileHolder = new ZipFileHolder()

const recordingService = new BrowserRecordingService(zipFileHolder)
const pingService = new BrowserPingService(zipFileHolder)

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
