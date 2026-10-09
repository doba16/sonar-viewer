import { createContext, type PropsWithChildren, useContext } from "react"
import type { PingService } from "./ping/ping-service"
import type { RecordingService } from "./recording/recording-service"

export type Services = {
	recordingService: RecordingService
	pingService: PingService
}

export const ServicesContext = createContext<Partial<Services>>({})

type ServicesProviderProps = PropsWithChildren<{
	services: Services
}>

export function ServicesProvider({ services, children }: ServicesProviderProps) {
	return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>
}

function useService<K extends keyof Services>(serviceName: K): Services[K] {
	const servicesContext = useContext(ServicesContext)

	const service = servicesContext[serviceName]

	if (service === undefined) {
		throw new Error(`Service not provided: ${serviceName}`)
	}

	return service
}

export function useRecordingsService() {
	return useService("recordingService")
}

export function usePingService() {
	return useService("pingService")
}
