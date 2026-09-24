import { useRef, useEffect, useState } from "react"
import type { Recording } from "../../../domain/recording/Recording"
import { usePingService } from "../../../domain/Services"
import { useAsyncEffect } from "../../hooks/useAsyncEffect"

type SonarViewProps = {
    recording: Recording,
    timePosition: number
}

type CanvasState = {
    canvasWidth: number,
    canvasHeight: number,
    timePosition: number,
    currentlyRefreshing: boolean
}

function shallowEqual<T extends Record<string, number | string | boolean> | undefined>(a: T, b: T) {
    if (a === b) {
        return true
    }
    if (a === undefined || b === undefined) {
        return false
    }
    for (let prop in a) {
        if (a[prop] !== b[prop]) {
            return false
        }
    }
    return true
}

export function SonarView({
    recording,
    timePosition
}: SonarViewProps) {

    const pingService = usePingService()

    const canvasRef = useRef<HTMLCanvasElement>(null)

    const [displayedCanvasState, setDisplayedCanvasState] = useState<CanvasState>({
        canvasWidth: -1, // A value that can never be the canvas size so that
        canvasHeight: -1, // the repaint necessary check will always fire
        timePosition: 0,
        currentlyRefreshing: false
    })
    const [targetCanvasState, setTargetCanvasState] = useState<CanvasState>()

    const [canvasSize, setCanvasSize] = useState({width: 100, height: 100})

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

    // Sync target state
    useEffect(() => {
        setTargetCanvasState({
            canvasWidth: canvasSize.width,
            canvasHeight: canvasSize.height,
            timePosition: timePosition,
            currentlyRefreshing: false
        })
    }, [canvasSize, timePosition])

    // Repaint canvas
    useAsyncEffect(async () => {
        if (!shallowEqual(displayedCanvasState, targetCanvasState)) {
            const canvas = canvasRef.current
            if (targetCanvasState === undefined || canvas === null) {
                // Nothing to render requested or nothing to render to yet
                return
            }

            if (displayedCanvasState.currentlyRefreshing) {
                // Do not dispatch a new repaint before the last one finished
                return
            }

            // Mark that a repaint has been requested
            setDisplayedCanvasState({
                ...displayedCanvasState,
                currentlyRefreshing: true
            })

            console.log("Target Canvas State", targetCanvasState)

            if (targetCanvasState.canvasHeight === 0 || targetCanvasState.canvasHeight === 0) return

            // Request repaint
            await pingService.renderPings(recording, targetCanvasState.timePosition, 90000, canvas, targetCanvasState.canvasWidth, targetCanvasState.canvasHeight)

            // Mark end of refresh
            setDisplayedCanvasState({
                ...targetCanvasState,
                currentlyRefreshing: false
            })
        }
    }, [targetCanvasState, displayedCanvasState, recording])

    return (
        <canvas ref={canvasRef} style={{gridColumn:"span 1", gridRow:"span 2"}} />
    )
}