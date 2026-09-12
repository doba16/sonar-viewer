import { useMemo } from "react"

type Amount = [number | undefined, string]

const UNITS: Amount[] = [
    [60, "s"],
    [60, "min"],
    [undefined, "h"],
] as const

type DurationProps = {
    duration: number
}

export function Duration({
    duration
}: DurationProps) {
    const components = useMemo<Amount[]>(() => {
        const components: [number, string][] = []
        let remaining = Math.floor(duration)

        for (let unit of UNITS) {
            if (unit[0] === undefined) {
                components.push(([remaining, unit[1]]))
                break
            }

            const component = remaining % unit[0]
            components.push(([component, unit[1]]))

            remaining = Math.floor(remaining / unit[0])

            if (remaining < 1) {
                break
            }
        }
        
        return components.slice(-2).reverse()
    }, [duration])

    return (
        components.map(c => `${c[0]} ${c[1]}`).join(" ")
    )
}