import SonarEmptyState from "../../icons/empty-state/sonar.svg?react"
import { EmptyState } from "../../widgets/empty-state/empty-state"
import "./welcome.css"
import { useCallback } from "react"
import { useRecordingsService } from "../../../domain/services"
import { Button } from "../../widgets/button/button"

export function Welcome() {
	const recordingsService = useRecordingsService()

	const handleOpen = useCallback(() => {
		recordingsService.openZip()
	}, [recordingsService.openZip])

	return (
		<main className="welcome">
			<EmptyState
				icon={<SonarEmptyState />}
				title={"Sieh dir deine Sonar-Aufzeichnungen an"}
				description={
					"Lade einfach deine Aufzeichnungen als Zip-Datei hoch und sieh sie dir an. Kein Programm installieren, einfach loslegen."
				}
				action={
					<Button variant="primary" startIcon="folder_open" onClick={handleOpen}>
						Aufzeichnungen öffnen
					</Button>
				}
			/>
		</main>
	)
}
