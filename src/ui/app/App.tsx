import { Suspense, useEffect, useState } from 'react'
import type { Recording, Recordings } from '../../domain/recording/Recording';
import Header, { type HeaderCenter } from '../widgets/header/Header';
import { RecordingList } from '../views/recordings-list/recordings-list';
import { useRecordingsService } from '../../domain/Services';
import "./App.css"
import { Welcome } from '../views/welcome/welcome';
import { RecordingViewer } from '../views/recording-viewer/recording-viewer';


function App() {
  
  const [recordings, setRecordings] = useState<Recordings>()
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
