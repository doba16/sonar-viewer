import { useRecordingsService } from "../../../domain/Services"
import "./header.css"

type RecordingsListHeaderCenter = {
    state: "recordings-list"
    filename: string,
    type: "zip" | "folder"
}

type RecordingHeaderCenter = {
    state: "recording",
    recordingName: string,
    recordingDate: Date,
    onBack: () => void
}

type EmptyHeaderCenter = {
    state: "empty"
}

export type HeaderCenter = RecordingsListHeaderCenter | RecordingHeaderCenter | EmptyHeaderCenter

type HeaderProps = {
    headerCenter: HeaderCenter
    openAboutDialog: () => void
}

function HeaderCenter({headerCenter}: {headerCenter: HeaderCenter}) {
    if (headerCenter.state === "recordings-list") {
        return (
            <div className="center framed">
                <span className="material-symbols-outlined">
                    {headerCenter.type === "zip" ? "folder_zip" : "folder"}
                </span>
                {headerCenter.filename}
            </div>
        )
    }

    if (headerCenter.state === "recording") {
        return (
            <div className="center">
                <button onClick={headerCenter.onBack}>
                    <span className="material-symbols-outlined">chevron_backward</span>
                </button>
                <div className="framed">
                    <span className="material-symbols-outlined">radio_button_checked</span>
                    {headerCenter.recordingName}

                    <div className="divider-inline" />

                    <span className="material-symbols-outlined">calendar_today</span>
                    {headerCenter.recordingDate.toLocaleString(undefined, {dateStyle: "medium", timeStyle: "short"})}
                </div>
            </div>
        )
    }
}

export default function Header({
    headerCenter,
    openAboutDialog
}: HeaderProps) {
    const recordingsService = useRecordingsService()

    return (
        <header className="header">
            <div className="left">
                <div className="logo">
                    Sonar Viewer
                </div>
                <button onClick={() => recordingsService.openZip()} title="Öffnen">
                    <span className="material-symbols-outlined">folder_open</span>
                </button>
                <button onClick={openAboutDialog} title="Öffnen">
                    <span className="material-symbols-outlined">info</span>
                </button>
            </div>
            <HeaderCenter headerCenter={headerCenter}/>
        </header>
    )
}
