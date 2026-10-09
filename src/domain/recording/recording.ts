import type { Coordinate } from "../ping/ping"

export type Recording = {
	name: string
	startTime: Date
	duration: number
	numberOfPings: number
	coordinate: Coordinate
}

export type Recordings = {
	recordings: Recording[]
	filepath: string
	type: "zip" | "folder"
}
