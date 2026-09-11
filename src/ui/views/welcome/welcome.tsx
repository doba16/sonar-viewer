import { EmptyState } from "../../widgets/empty-state/empty-state";
import SonarEmptyState from "../../icons/empty-state/sonar.svg?react"
import "./welcome.css"
import { Button } from "../../widgets/button/button";
import { useRecordingsService } from "../../../domain/Services";
import { useCallback } from "react";

export function Welcome() {
    const recordingsService = useRecordingsService()

    const handleOpen = useCallback(() => {
        recordingsService.openZip()
    }, [])

    return (
        <main className="welcome">
            <EmptyState
                icon={<SonarEmptyState/>}
                title={"Sieh dir deine Sonar-Aufzeichnungen an"}
                description={"Lade einfach deine Aufzeichnungen als Zip-Datei hoch und sieh sie dir an. Kein Programm installieren, einfach loslegen."}
                action={<Button variant="primary" startIcon="folder_open" onClick={handleOpen}>Aufzeichnungen öffnen</Button>}
            />
        </main>
    )
}
