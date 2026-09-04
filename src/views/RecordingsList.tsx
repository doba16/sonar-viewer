import type { Recording } from "../domain/recording/Recording"

type RecordingListProps = {
  recordings: Recording[] | undefined,
  onRecordingSelected: (recording: Recording) => void
}

export function RecordingList({
  recordings,
  onRecordingSelected
}: RecordingListProps) {
  
  if (!recordings) {
    return (
      <>
        Keine Aufzeichnungen!
      </>
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