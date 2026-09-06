import { createRef, useEffect } from "react"
import type { Ping } from "../domain/ping/Ping"

type PingsCanvasProps = {
    pings: Ping[]
}

export function PingsCanvas({
    pings
}: PingsCanvasProps) {

    console.log("Render Canvas")

    const canvasRef = createRef<HTMLCanvasElement>()
    
    useEffect(() => {
        const graphicsContext = canvasRef.current?.getContext("2d")
        if (!graphicsContext) return

        for (let y = 0; y < 500 && y < pings.length; y++) {
            for (let x = 0; x < 500; x++) {
                const color = pings[y].soundReturns[x*2]
                graphicsContext.fillStyle = `rgb(${color}, ${color}, ${color})`
                graphicsContext.fillRect(x, y, 1, 1)
            }
        }
    }, [pings])

    return (
        <canvas width={500} height={500} ref={canvasRef} />
    )
}