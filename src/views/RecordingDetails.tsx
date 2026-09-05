import { useEffect, useState } from "react"
import type { Recording } from "../domain/recording/Recording"
import { usePingService } from "../domain/Services"
import type { Ping } from "../domain/ping/Ping"
import { PingsCanvas } from "./PingsCanvas"

type RecordingDetailsProps = {
    recording: Recording
}

export function RecordingDetails({
    recording
}: RecordingDetailsProps) {
    
    console.log("Render Details")

    const pingService = usePingService()

    const [pingsObj, setPings] = useState<[Ping[], number, number]>()

    useEffect(() => {
        (async () => {
            const pings = await pingService.loadPings(recording, "side-scan-port")

            const minReturns = pings.reduce((prev, current) => Math.min(prev, current.numberOfReturns), Infinity)
            const maxReturns = pings.reduce((prev, current) => Math.max(prev, current.numberOfReturns), -Infinity)

            setPings([pings, minReturns, maxReturns])
        })()
    }, [recording])

    if (pingsObj === undefined) {
        return "Pings laden..."
    }
    
    const [pings, minReturns, maxReturns] = pingsObj

    return (
        <>
            Min Returns: {minReturns} Max Returns: {maxReturns}

            <PingsCanvas pings={pings} />
        </>
    )
}