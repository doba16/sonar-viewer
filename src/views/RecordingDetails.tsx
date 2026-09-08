import { useState } from "react"
import type { Recording } from "../domain/recording/Recording"
import { PingsCanvas } from "./PingsCanvas"

type RecordingDetailsProps = {
    recording: Recording
}

export function RecordingDetails({
    recording
}: RecordingDetailsProps) {
    
    console.log("Render Details")

    const [timePos, setTimePos] = useState(0)

    return (
        <>
            <input type="range" min={0} max={100000} onChange={e => setTimePos(Number.parseInt(e.target.value))}/>

            <PingsCanvas recording={recording} timePos={timePos} />
        </>
    )
}