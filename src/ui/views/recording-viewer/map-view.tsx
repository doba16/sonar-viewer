import {Control, DomEvent, DomUtil, LatLng, Map, map, point, polyline, Projection, tileLayer} from "leaflet"
import { useRef } from "react"
import "leaflet/dist/leaflet.css"
import type { Recording } from "../../../domain/recording/Recording"
import { usePingService } from "../../../domain/Services"
import { useAsyncEffect } from "../../hooks/useAsyncEffect"
import type { Coordinate } from "../../../domain/ping/Ping"
import BoatPositionIcon from "../../icons/misc/boat-location.svg?react"
import "./map-view.css"
import { useViewerState } from "./viewer-state"

const EASTING_CALIB = 0.9999700053853967 // 0.9998827585548765
const NORTHING_CALIB = 0.9999824592232249 // 0.9999868838656377

type FollowMode = "centered" | "following" | "detached"

const FOLLOW_MODE_ICONS: Record<FollowMode, string> = {
    "centered": "my_location",
    "detached": "location_searching",
    "following": "keep"
} 

class SonarMap {

    private _map: Map
    private _boatMarker: HTMLElement
    private _boatPosition: Coordinate
    private _boatPositionLatLng: LatLng
    private _boatRotation: number = 0

    private _followMode: FollowMode = "centered"
    private _positionFollowButton: HTMLAnchorElement | undefined

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

        // Add button for follow mode
        this._addPositionButton()

        // Handler for updating follow mode on drag
        this._map.addEventListener("dragstart", () => this._setFollowMode("detached"))
        this._map.addEventListener("zoom", () => this._setFollowMode("detached"))
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

        if (this._followMode === "following") {
            this._map.panTo(this._boatPositionLatLng)
        } else {
            this._setFollowMode("detached")
        }
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

    private _addPositionButton() {
        const PositionFollowButton = Control.extend({
            options: {
                position: "topleft"
            },

            onAdd: () => {
                const container = DomUtil.create(
                    'div',
                    'leaflet-bar leaflet-control leaflet-control-mybutton'
                );

                const button = DomUtil.create('a', '', container);
                button.href = '#';
                button.title = 'Meine Aktion';
                button.className = "material-symbols-outlined"
                button.innerHTML = 'location_searching';

                DomEvent.on(button, 'click', (event) => {
                    DomEvent.stopPropagation(event);
                    DomEvent.preventDefault(event);

                    if (this._followMode === "detached") {
                        this._map.panTo(this._boatPositionLatLng)
                        this._setFollowMode("centered")
                    } else if (this._followMode === "centered") {
                        this._setFollowMode("following")
                    }
                });

                this._positionFollowButton = button

                return container;
            }
        })

        this._map.addControl(new PositionFollowButton())
    }

    private _setFollowMode(mode: FollowMode) {
        this._followMode = mode

        if (this._positionFollowButton) {
            this._positionFollowButton.innerText = FOLLOW_MODE_ICONS[mode]
        }
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

    const {} = useViewerState(async (state) => {
        const position = await pingService.findCoordinateAt(recording, state.timePosition)

        const map = mapRef.current
        if (!map) return

        console.log("Boat position:", position, "rotation", position.heading )

        map.boatPosition = position.coordinate
        map.boatRotation = position.heading
    }, {timePosition}, [recording])


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
        
    }, [timePosition])

    return (
        <div ref={mapRootRef} style={{gridColumn:"2 / span 1", gridRow:"span 2"}}>
            <BoatPositionIcon id="boat-marker" className="boat-marker"/>
        </div>
    )

}
