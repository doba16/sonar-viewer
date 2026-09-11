import { useRecordingsService } from "../../../domain/Services"
import "./header.css"

export default function Header() {
    const recordingsService = useRecordingsService()
    
    return (
        <header className="header">
            <div className="logo">
                Sonar Viewer
            </div>
            <button onClick={() => recordingsService.openZip()}>
                <span className="material-symbols-outlined">folder_open</span>
            </button>
        </header>
    )
}
