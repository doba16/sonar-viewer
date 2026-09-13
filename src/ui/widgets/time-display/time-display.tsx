type TimeDisplayProps = {
    time: number,
    forceHours?: boolean
}

export function TimeDisplay({
    time,
    forceHours = false
}: TimeDisplayProps) {
    let remaining = Math.floor(time)
    
    const secs = remaining % 60;
    remaining = Math.floor(remaining / 60)

    const mins = remaining % 60;
    remaining = Math.floor(remaining / 60)

    const hours = remaining

    const secsString = secs.toString().padStart(2, "0")

    if (hours > 0 || forceHours) {
        const minsString = mins.toString().padStart(2, "0")
        return `${hours}:${minsString}:${secsString}`
    }

    return `${mins}:${secsString}`

}