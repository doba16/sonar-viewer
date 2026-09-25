/// <reference lib="webworker" />

import type { Listenable, ListenableEvents } from "../../domain/listenable/listenable";
import type { FromWorkerMessage, InvocableObjects, ListenableMembers, ToWorkerMessage } from "./messages"


function isListenable<T extends ListenableEvents>(object: any): object is Listenable<T> {
    return 'addWildcardListener' in object;
}

export function setupWorkerMessaging<T extends InvocableObjects>(invocableObjects: T) {
    self.addEventListener("message", async (event: MessageEvent<ToWorkerMessage<T>>) => {
        const data = event.data
        if (!data) {
            console.warn("No data in message!", event)
        }
        const pendingResult = invocableObjects[data.invocable][data.method](...data.args)

        let result

        if (pendingResult instanceof Promise) {
            result = await pendingResult
        } else {
            result = pendingResult
        }

        const resultMessage: FromWorkerMessage<T> = {
            type: "result",
            invocable: data.invocable,
            method: data.method,
            result: result,
            callId: data.callId
        }

        if (result instanceof ImageBitmap) {
            postMessage(resultMessage, [result])
        } else {
            postMessage(resultMessage)
        }
    })

    for (const i in invocableObjects) {
        const invocable: unknown = invocableObjects[i]

        if (isListenable(invocable)) {
            const l = i as keyof T as keyof ListenableMembers<T>
            invocable.addWildcardListener((e, d) => {
                const message: FromWorkerMessage<T> = {
                    type: "event",
                    listenable: l,
                    event: e,
                    data: d
                }
                postMessage(message)
            })
        }
    }
}
