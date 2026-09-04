import { useEffect, useState } from 'react'
import './App.css'
import type { Recording } from '../domain/recording/Recording';
import Header from './widgets/Header';
import { RecordingList } from '../views/RecordingsList';
import { useRecordingsService } from '../domain/Services';



function App() {
  
  const [recordings, setRecordings] = useState<Recording[]>()
  const [selectedRecording, setSelectedRecording] = useState<Recording>()

  const recordingService = useRecordingsService()

  useEffect(() => {
    recordingService.setRecordingsOpenedCallback(setRecordings)
    return () => recordingService.clearRecordingsService()
  })

  return (
    <>
      <Header>

      </Header>

      { selectedRecording === undefined &&
        <RecordingList
          recordings={recordings}
          onRecordingSelected={setSelectedRecording}
        />
      }

      { selectedRecording !== undefined &&
        <>
          <button onClick={() => setSelectedRecording(undefined)}>Zurück zur Auswahl</button>

          <div>
            <div>{selectedRecording.name}</div>
          </div>
          
        </>
      }


    </>
  )
}

export default App
