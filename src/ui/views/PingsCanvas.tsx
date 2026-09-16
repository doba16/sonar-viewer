import { useRef, useEffect } from "react"
import type { Recording } from "../../domain/recording/Recording"
import { usePingService } from "../../domain/Services"

type PingsCanvasProps = {
    timePos: number,
    recording: Recording
}

export function PingsCanvas({
    recording,
    timePos
}: PingsCanvasProps) {

    const pingService = usePingService()

    console.log("Render Canvas")

    const canvasRef = useRef<HTMLCanvasElement>(null)
    
    useEffect(() => {
        
            if (!canvasRef.current) return
            pingService.renderPings(recording, timePos, 10000, canvasRef.current!, 100, 100)
        
    }, [timePos])

    return (
        <canvas width={500} height={500} ref={canvasRef} />
    )
}