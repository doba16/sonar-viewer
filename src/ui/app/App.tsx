import { Suspense, useEffect, useState } from 'react'
import type { Recording, Recordings } from '../../domain/recording/Recording';
import Header, { type HeaderCenter } from '../widgets/header/Header';
import { RecordingList } from '../views/recordings-list/recordings-list';
import { useRecordingsService } from '../../domain/Services';
import "./App.css"
import { Welcome } from '../views/welcome/welcome';
import { RecordingViewer } from '../views/recording-viewer/recording-viewer';
import { Dialog } from '../widgets/dialog/dialog';
import type { RecordingsOpenEvent } from '../../domain/recording/RecordingService';


function App() {
  
  const [recordings, setRecordings] = useState<Recordings>()
  const [selectedRecording, setSelectedRecording] = useState<Recording>()
  const [openingState, setOpeningState] = useState<"none" | "opening" | "error">("none")
  const [openingError, setOpeningError] = useState<unknown>()

  const recordingService = useRecordingsService()

  useEffect(() => {
    recordingService.setRecordingsOpenCallback((e: RecordingsOpenEvent) => {
      if (e.status === "opening") {
        setOpeningState("opening")
      } else if (e.status === "success") {
        setOpeningState('none')
        setRecordings(e.recordings)
      } else {
        setOpeningState("error")
        setOpeningError(e.error)
      }
    })

    return () => recordingService.clearRecordingsService()
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
      <Header headerCenter={headerCenter}/>
      
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
    </>
  )
}

export default App
