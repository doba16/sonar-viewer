import { Suspense, useEffect, useState } from 'react'
import type { Recording } from '../../domain/recording/Recording';
import Header, { type HeaderCenter } from '../widgets/header/Header';
import { RecordingList } from '../views/recordings-list/recordings-list';
import { useRecordingsService } from '../../domain/Services';
import { RecordingDetails } from '../views/RecordingDetails';
import "./App.css"
import { Welcome } from '../views/welcome/welcome';


function App() {
  
  const [recordings, setRecordings] = useState<Recording[]>()
  const [selectedRecording, setSelectedRecording] = useState<Recording>()

  const recordingService = useRecordingsService()

  useEffect(() => {
    recordingService.setRecordingsOpenedCallback(setRecordings)
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
        filename: "Recordings.zip",
        type: "zip"
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
      
        { recordings === undefined && 
          <Welcome />
        }

        { recordings !== undefined && selectedRecording === undefined &&
          <RecordingList
            recordings={recordings}
            onRecordingSelected={setSelectedRecording}
          />
        }

        { selectedRecording !== undefined &&
          <>
            <button onClick={() => setSelectedRecording(undefined)}>Zurück zur Auswahl</button>

            <Suspense fallback="Loading pings...">
              <RecordingDetails recording={selectedRecording}/>
            </Suspense>
          </>
        }
    </>
  )
}

export default App
