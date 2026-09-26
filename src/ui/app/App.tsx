import { Suspense, useEffect, useState } from 'react'
import type { Recording, Recordings } from '../../domain/recording/Recording';
import Header, { type HeaderCenter } from '../widgets/header/Header';
import { RecordingList } from '../views/recordings-list/recordings-list';
import { useRecordingsService } from '../../domain/Services';
import "./App.css"
import { Welcome } from '../views/welcome/welcome';
import { RecordingViewer } from '../views/recording-viewer/recording-viewer';
import { Dialog } from '../widgets/dialog/dialog';
import SonarViewerIcon from "../icons/empty-state/sonar.svg?react"

function App() {
  
  const [recordings, setRecordings] = useState<Recordings>()
  const [selectedRecording, setSelectedRecording] = useState<Recording>()
  const [openingState, setOpeningState] = useState<"none" | "opening" | "error">("none")
  const [openingError, setOpeningError] = useState<unknown>()

  const recordingService = useRecordingsService()

  const [aboutDialogVisible, setAboutDialogVisible] = useState(false)

  useEffect(() => {
    const l1 = recordingService.addListener("opening", () => setOpeningState("opening"))
    const l2 = recordingService.addListener("success", (d) => {
      setOpeningState('none')
      setRecordings(d.recordings)
    })
    const l3 = recordingService.addListener("error", (d) => {
      setOpeningState("error")
      setOpeningError(d.error)
    })

    return () => recordingService.removeEventListener(l1, l2, l3)
  })

  const headerCenter = ((): HeaderCenter => {
    if (recordings === undefined) {
      return {
        state: 'empty',
      }
    }

    if (selectedRecording === undefined) {
      return {
        state: "recordings-list",
        filename: recordings.filepath,
        type: recordings.type
      }
    } else {
      return {
        state: "recording",
        recordingName: selectedRecording.name,
        recordingDate: selectedRecording.startTime,
        onBack: () => setSelectedRecording(undefined)
      }
    }
  })()

  return (
    <>
      <Header headerCenter={headerCenter} openAboutDialog={() => setAboutDialogVisible(true)}/>
      
      <Dialog
        open={openingState !== "none"}
        title='Aufzeichnungen öffnen'
        primaryButtonText={openingError !== undefined ? 'Ok' : undefined}
        primaryButtonCallback={() => {
          setOpeningError(undefined)
          setOpeningState('none')
        }}
      >
        {openingError === undefined ? (
          "Aufzeichnungen werden geöffnet..."
        ) : (
          "Die Aufzeichnungen konnten nicht geöffnet werden."
        )}
      </Dialog>

      { recordings === undefined && 
        <Welcome />
      }

      { recordings !== undefined && selectedRecording === undefined &&
        <RecordingList
          recordings={recordings.recordings}
          onRecordingSelected={setSelectedRecording}
        />
      }

      { selectedRecording !== undefined &&
        <>
          <Suspense fallback="Loading pings...">
            <RecordingViewer recording={selectedRecording}/>
          </Suspense>
        </>
      }

      <Dialog
          title='Über Sonar Viewer'
          open={aboutDialogVisible}
          primaryButtonCallback={() => setAboutDialogVisible(false)}
          primaryButtonText='Schließen'
      >
        <div className='product-info'>
          <SonarViewerIcon/>
          <div>
            <div><strong>Sonar Viewer</strong> by Dominik Bastian</div>
            <div>
              <span className='material-symbols-outlined'>code_xml</span>
              <a href="https://github.com/doba16/sonar-viewer" target='blank'>https://github.com/doba16/sonar-viewer</a>
            </div>
            <div>
              <span className='material-symbols-outlined'>open_in_new</span>
              <a href="licenses.txt" target='blank'>Open Source Lizenzen</a>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  )
}

export default App
