import type { Recording } from "../../../domain/recording/Recording"
import { Button } from "../../widgets/button/button"
import { DataTable } from "../../widgets/data-table/data-table"
import { Duration } from "../../widgets/duration/duration"
import { EmptyState } from "../../widgets/empty-state/empty-state"
import "./recordings-list.css"
import FolderSearchEmptyStateIcon from "../../icons/empty-state/folder-search.svg?react"

type RecordingListProps = {
  recordings: Recording[],
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
    <main className="recordings-list">
      {/*<div className="recordings-details">
        <span className="material-symbols-outlined">folder_zip</span>
        <div className="recordings-metadata">
          <h1>Aufzeichnungen</h1>
          <div className="recordings-name">Recordings.zip</div>
        </div>
      </div>*/}
      <DataTable>
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
          {recordings.length === 0 ?
            <tr>
              <td colSpan={5}>
                <EmptyState
                  title="Keine Aufnahmen gefunden"
                  description="Es wurden keine Aufnahmen an dem ausgewählten Speicherort gefunden."
                  icon={<FolderSearchEmptyStateIcon/>}
                  size="medium"
                />
              </td>
            </tr>
          :
            recordings?.map(r => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td>{r.startTime.toLocaleString("de-DE", {dateStyle: "medium", timeStyle: "short"})}</td>
                <td><Duration duration={r.duration / 1000}/></td>
                <td>{r.numberOfPings}</td>
                <td><Button variant="secondary" icon="visibility" onClick={() => onRecordingSelected(r)}></Button></td>
              </tr>
            ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={5}>
              {recordings.length !== 1 ? `${recordings.length} Aufnahmen` : `${recordings.length} Aufnahme`}
            </td>
          </tr>
        </tfoot>
      </DataTable>
    </main>
  )
}