import {LatLng, Map, map, point, polyline, Projection, tileLayer} from "leaflet"
import { useRef } from "react"
import "leaflet/dist/leaflet.css"
import type { Recording } from "../../../domain/recording/Recording"
import { usePingService } from "../../../domain/Services"
import { useAsyncEffect } from "../../hooks/useAsyncEffect"
import type { Coordinate } from "../../../domain/ping/Ping"
import BoatPositionIcon from "../../icons/misc/boat-location.svg?react"
import "./map-view.css"

const EASTING_CALIB = 0.9999700053853967 // 0.9998827585548765
const NORTHING_CALIB = 0.9999824592232249 // 0.9999868838656377

class SonarMap {

    private _map: Map
    private _boatMarker: HTMLElement
    private _boatPosition: Coordinate
    private _boatPositionLatLng: LatLng
    private _boatRotation: number = 0

    constructor(mapContainer: HTMLElement, center: Coordinate) {
        // Create map
        this._map = map(mapContainer)
        this._map.setView(this._convert(center), 17)

        // Add OpenStreetMap tile layer
        tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this._map);

        // Add boat
        this._boatMarker = document.getElementById("boat-marker")!
        this._boatPosition = center
        this._boatPositionLatLng = this._convert(center)
        this._updateBoat()

        this._map.addEventListener("move", () => this._updateBoat())
        this._map.addEventListener("zoomanim", () => this._updateBoat())
    }

    addTrack(coordinates: Coordinate[]) {
        const trackPoints = coordinates.map(this._convert)
        const track = polyline(trackPoints, {
            color: "var(--color-red)"
        })
        track.addTo(this._map)
    }

    get boatPosition() {
        return this._boatPosition
    }

    set boatPosition(position: Coordinate) {
        this._boatPosition = position
        this._boatPositionLatLng = this._convert(position)
        this._updateBoat()
    }

    get boatRotation() {
        return this._boatRotation
    }

    set boatRotation(rotation: number) {
        this._boatRotation = rotation
        this._updateBoat()
    }

    private _updateBoat() {
        const pixelPosition = this._map.latLngToContainerPoint(this._boatPositionLatLng)
        this._boatMarker.style.setProperty("--boat-translate-x", `${pixelPosition.x}px`)
        this._boatMarker.style.setProperty("--boat-translate-y", `${pixelPosition.y}px`)
        this._boatMarker.style.setProperty("--boat-rotation", `${this.boatRotation}deg`)
    }

    private _convert(coordinate: Coordinate): LatLng {
        const p = point(coordinate.easting * EASTING_CALIB, coordinate.northing * NORTHING_CALIB)
        return Projection.Mercator.unproject(p)
    }
}

type MapViewProps = {
    recording: Recording,
    timePosition: number
}

export function MapView({
    recording,
    timePosition
}: MapViewProps) {

    const mapRef = useRef<SonarMap>(null)
    const mapRootRef = useRef<HTMLDivElement>(null)

    const pingService = usePingService()

    useAsyncEffect(async () => {
        const mapRoot = mapRootRef.current
        if (!mapRoot || mapRef.current != null) {
            return
        }

        const map = new SonarMap(mapRoot, recording.coordinate)
        mapRef.current = map

        const coords = await pingService.findCoordinates(recording)
        map.addTrack(coords)
    }, [recording])

    useAsyncEffect(async () => {
        const position = await pingService.findCoordinateAt(recording, timePosition)

        const map = mapRef.current
        if (!map) return

        console.log("Boat position:", position, "rotation", position.heading )

        map.boatPosition = position.coordinate
        map.boatRotation = position.heading
    }, [timePosition])

    return (
        <div ref={mapRootRef} style={{gridColumn:"2 / span 1", gridRow:"span 2"}}>
            <BoatPositionIcon id="boat-marker" className="boat-marker"/>
        </div>
    )

}
