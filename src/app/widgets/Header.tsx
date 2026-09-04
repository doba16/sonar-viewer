import { useRecordingsService } from "../../domain/Services"

export default function Header() {
    const recordingsService = useRecordingsService()
    
    return (
        <header>
            <button onClick={() => recordingsService.openZip()}>
                ZIP öffnen
            </button>
        </header>
    )
}
