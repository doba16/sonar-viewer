import { useState } from "react"
import type { Recording } from "../../../domain/recording/Recording"
import "./recording-viewer.css"
import { TimeDisplay } from "../../widgets/time-display/time-display";
import { SonarView } from "./sonar-view";
import { MapView } from "./map-view";


declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}

type RecordingViewerProps = {
    recording: Recording
}

export function RecordingViewer({
    recording
}: RecordingViewerProps) {

    const [timePosition, setTimePosition] = useState(0)

    const longerThanOneHour = recording.duration > 3600000

    return (
        <main className="recording-viewer">
            <div className="viewers">
                <SonarView recording={recording} timePosition={timePosition} />
                <MapView recording={recording} timePosition={timePosition} />
            </div>
            <div className="timeline">
                <div>
                    <TimeDisplay time={timePosition / 1000} forceHours={longerThanOneHour}/>
                </div>
                <div className="slider">
                    <div style={{"--slider-max": recording.duration, "--slider-value": timePosition}}></div>
                    <input type="range" min={0} max={recording.duration} value={timePosition} step={500} onChange={e => setTimePosition(Number.parseInt(e.target.value))} />
                </div>
                <div>
                    <TimeDisplay time={recording.duration / 1000} forceHours={longerThanOneHour}/>
                </div>
            </div>
        </main>
    )
}
