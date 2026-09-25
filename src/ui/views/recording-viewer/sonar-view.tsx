import { useRef, useEffect, useState } from "react"
import type { Recording } from "../../../domain/recording/Recording"
import { usePingService } from "../../../domain/Services"
import { useViewerState } from "./viewer-state"

type SonarViewProps = {
    recording: Recording,
    timePosition: number
}

export function SonarView({
    recording,
    timePosition
}: SonarViewProps) {

    const pingService = usePingService()

    const canvasRef = useRef<HTMLCanvasElement>(null)

    const [canvasSize, setCanvasSize] = useState({width: 0, height: 0})

    // Resize Observer
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) {
            return
        }
        
        const resizeHandler = () => {
            setCanvasSize({
                width: canvas.clientWidth,
                height: canvas.clientHeight
            })
        }

        const resizeObserver = new ResizeObserver(resizeHandler)
        resizeObserver.observe(canvas)

        resizeHandler()

        return () => resizeObserver.disconnect()
    }, [])

    const targetCanvasState = {
        canvasWidth: canvasSize.width,
        canvasHeight: canvasSize.height,
        timePosition: timePosition
    }

    // Repaint canvas
    useViewerState(async (state) => {
        const canvas = canvasRef.current
        if (!canvas) return
        
        // Request repaint
        await pingService.renderPings(recording, state.timePosition, 90000, canvas, targetCanvasState.canvasWidth, targetCanvasState.canvasHeight)
    }, targetCanvasState, [recording])

    return (
        <canvas ref={canvasRef} style={{gridColumn:"span 1", gridRow:"span 2"}} />
    )
}