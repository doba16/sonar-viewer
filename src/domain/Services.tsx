import { createContext, useContext, type PropsWithChildren } from "react"
import type { RecordingService } from "./recording/RecordingService"

export type Services = {
    recordingService: RecordingService
}

export const ServicesContext = createContext<Partial<Services>>({})

type ServicesProviderProps = PropsWithChildren<{
    services: Services
}>

export function ServicesProvider({
    services,
    children
}: ServicesProviderProps) {
    return (
        <ServicesContext.Provider value={services}>
            {children}
        </ServicesContext.Provider>
    )
}

function useService(serviceName: keyof Services): Services[typeof serviceName] {
    const servicesContext = useContext(ServicesContext)

    const service = servicesContext[serviceName]

    if (service === undefined) {
        throw new Error("Service not provided: " + serviceName)
    }

    return service
}

export function useRecordingsService() {
    return useService("recordingService")
}
