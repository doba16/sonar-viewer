/*
type CallbackType = "open-recordings"

export type FromWorkerCallbackMessage<T extends unknown[]> = {
    type: "callback",
    callback: CallbackType,
    args: T
}

export type FromWorkerResultMessage = {
    type: "result",
    invocation: Symbol,
    result: unknown
}

export type FromWorkerMessage<T extends unknown[]> = FromWorkerCallbackMessage<T> | FromWorkerResultMessage
*/

import { DefaultListenable, type Listenable, type ListenableEvents } from "../../domain/listenable/listenable"
import type { PingRepository } from "../repositories/ping-repository"
import type { RecordingRepository } from "../repositories/recording-repository"

type FunctionMembers<T> = {
    [K in keyof T as T[K] extends (...args: any[]) => any ? K : never]: T[K]
}

export type ListenableMembers<T> = {
    [K in keyof T as T[K] extends Listenable<any> ? K : never]: T[K]
}

export type ListenersEvents<T> = T extends Listenable<infer E> ? E : never

export type InvocableObjects = Record<string, any>

// Messages to the worker are always calls, so no message type required
export type ToWorkerMessage<T extends InvocableObjects, I extends keyof T = keyof T, M extends keyof FunctionMembers<T[I]> = keyof FunctionMembers<T[I]>> = {
    invocable: keyof T,
    method: M
    args: Parameters<T[M]>,
    callId: number
}

export type FromWorkerMessage<T extends InvocableObjects> = {
    type: "event",
    listenable: keyof ListenableMembers<T>,
    event: keyof ListenersEvents<T[keyof ListenableMembers<T>]>,
    data: ListenersEvents<T[keyof ListenableMembers<T>]>[keyof ListenersEvents<T[keyof ListenableMembers<T>]>]
} | {
    type: "result",
    invocable: keyof T,
    method: keyof FunctionMembers<T[keyof T]>,
    result: Awaited<ReturnType<FunctionMembers<T[keyof T]>[keyof FunctionMembers<T[keyof T]>]>>,
    callId: number
}

class RepeatingListenable<T extends ListenableEvents> extends DefaultListenable<T> {

    publishEvent<E extends keyof T>(event: E, data: T[E]): void {
        super.publishEvent(event, data)    
    }

}

export class WorkerInvoker<T extends InvocableObjects> {

    private _worker: Worker

    private _listeners = new Map<keyof ListenableMembers<T>, RepeatingListenable<any>>()

    private _callbacks = new Map<number, (result: Awaited<ReturnType<FunctionMembers<T[keyof T]>[keyof FunctionMembers<T[keyof T]>]>>) => void>()

    private _nextCallId = 0

    constructor(worker: Worker) {
        this._worker = worker
        this.setupListener()
    }

    call<I extends keyof T, M extends keyof FunctionMembers<T[I]>>(invocable: I, method: M, ...args: Parameters<FunctionMembers<T[I]>[M]>): Promise<Awaited<ReturnType<FunctionMembers<T[I]>[M]>>> {
        const callId = this._nextCallId++
        
        const result = new Promise<Awaited<FunctionMembers<T[I]>[M]>>((resolve) => {
            this._callbacks.set(callId, resolve)
        })

        const message: ToWorkerMessage<T> = {
            invocable: invocable,
            method: method,
            args: args,
            callId: callId
        }
        this._worker.postMessage(message)
        
        return result
    }

    listenable<L extends keyof ListenableMembers<T>>(listenable: L): Listenable<ListenersEvents<T[L]>> {
        let l = this._listeners.get(listenable)
        if (!l) {
            l = new RepeatingListenable()
            this._listeners.set(listenable, l)
        }
        return l as Listenable<ListenersEvents<T[L]>>
    }

    private setupListener() {
        this._worker.addEventListener("message", (event: MessageEvent<FromWorkerMessage<T>>) => {
            const data = event.data
            if (!data) return

            if (data.type === "event") {
                const listenable = data.listenable
                this._listeners.get(listenable)?.publishEvent(data.event, data.data)
            } else if (data.type === "result") {
                const callId = data.callId

                const callback = this._callbacks.get(callId)

                // TODO also catch exception and transfer from worker

                callback?.(data.result)
            }
        })
    }

}

/**
 * Bridge for the app.
 */
export type SonarViewerInvocableObjects = {
    pingRepository: PingRepository,
    recordingRepository: RecordingRepository
}
