import { useCallback, useState, type ChangeEvent } from 'react'
import './App.css'
import { BlobReader, BlobWriter, Uint8ArrayWriter, ZipReader } from '@zip.js/zip.js';

type Recording = {
  name: string,
  startTime: Date,
  duration: number,
  numberOfPings: number
}

function readUint32(buffer: Uint8Array, offset: number) {
  return buffer[offset + 3] << 24 | buffer[offset + 2] << 16 | buffer[offset + 1] << 8 | buffer[offset]
}

type RecordingListProps = {
  recordings: Recording[] | undefined,
  onRecordingSelected: (recording: Recording) => void
}

function RecordingList({
  recordings,
  onRecordingSelected
}: RecordingListProps) {
  if (!recordings) {
    return (
      <></>
    )
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Datum</th>
          <th>Dauer</th>
          <th>Anzahl von Pings</th>
          <th>Aktionen</th>
        </tr>
      </thead>
      <tbody>
        {recordings?.map(r => (
          <tr key={r.name}>
            <td>{r.name}</td>
            <td>{r.startTime.toLocaleDateString() + ", " + r.startTime.toLocaleTimeString()}</td>
            <td>{(r.duration / 1000 / 60).toFixed(1)} Minuten</td>
            <td>{r.numberOfPings}</td>
            <td><button onClick={() => onRecordingSelected(r)}>Aufzeichnung ansehen</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function App() {
  
  const [recordings, setRecordings] = useState<Recording[]>()
  const [selectedRecording, setSelectedRecording] = useState<Recording>()

  const handleFileUpload = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file === undefined) {
      console.log("No file uploaded!")
      return
    }
    const blob = new Blob([file], { type: file.type })

    const blobReader = new BlobReader(blob)
    const zipFileReader = new ZipReader(blobReader)

    const entries = await zipFileReader.getEntries()

    const recs: Recording[] = []

    for (const entry of entries) {
      if (entry.directory) continue

      if (entry.filename.toLowerCase().endsWith(".dat")) {
        const arrayWriter = new Uint8ArrayWriter()
        await entry.getData(arrayWriter)
        const bytes = await arrayWriter.getData()

        const startTime = readUint32(bytes, 20) // bytes[23] << 24 || bytes[22] << 16 || bytes[21] << 8 || bytes[20]
        const duration = readUint32(bytes, 48) // bytes[51] << 24 || bytes[50] << 16 || bytes[49] << 8 || bytes[48]
        const numberOfPings = readUint32(bytes, 44) // bytes[47] << 24 || bytes[46] << 16 || bytes[45] << 8 || bytes[44]

        recs.push({
          name: entry.filename,
          startTime: new Date(startTime * 1000),
          duration: duration,
          numberOfPings
        })
      }

    }

    setRecordings(recs)
  }, [])

  return (
    <>
      <input type='file' onChange={handleFileUpload}/>

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
