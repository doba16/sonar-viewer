export type Ping = {
    recordNumber: number,
    numberOfReturns: number,
    soundReturns: Uint8Array,
    timeElapsed: number
}

export type BoatPosition = {
    coordinate: Coordinate,
    heading: number
}

export type Coordinate = {
    easting: number,
    northing: number
}
