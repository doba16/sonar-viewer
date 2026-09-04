import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.tsx'
import { BrowserRecordingService } from './adapters/recording/BrowserRecordingService.ts'
import { ServicesProvider, type Services } from './domain/Services.tsx'

const recordingService = new BrowserRecordingService()
const services: Services = {
  recordingService
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ServicesProvider services={services}>
      <App />
    </ServicesProvider>
  </StrictMode>,
)
