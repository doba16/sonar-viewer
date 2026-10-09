export type ListenerId = symbol

// biome-ignore lint/suspicious/noExplicitAny: TODO refactor not to use any
export type ListenableEvents = Record<string, any>

type Listener<T> = (data: T) => void

type WildcardListener<L extends ListenableEvents> = (event: keyof L, data: L[keyof L]) => void

export interface Listenable<L extends ListenableEvents> {
	addListener<E extends keyof L>(event: E, listener: Listener<L[E]>): ListenerId

	addWildcardListener(listener: WildcardListener<L>): ListenerId

	removeEventListener(...listenerIds: ListenerId[]): void
}

export class DefaultListenable<L extends ListenableEvents> implements Listenable<L> {
	private _listeners = [] as [ListenerId, keyof L, Listener<L[keyof L]>][]
	private _wildcardListeners = new Map<ListenerId, WildcardListener<L>>()

	addListener<E extends keyof L>(event: E, listener: Listener<L[E]>): ListenerId {
		const id = Symbol()
		this._listeners.push([id, event, listener as Listener<L[keyof L]>])
		return id
	}

	addWildcardListener(listener: WildcardListener<L>): ListenerId {
		const id = Symbol()
		this._wildcardListeners.set(id, listener)
		return id
	}

	removeEventListener(...listenerIds: ListenerId[]): void {
		for (const listenerId of listenerIds) {
			this._wildcardListeners.delete(listenerId)
		}
		this._listeners = this._listeners.filter(([id]) => !listenerIds.includes(id))
	}

	protected publishEvent<E extends keyof L>(event: E, data: L[E]) {
		this._wildcardListeners.forEach(listener => {
			listener(event, data)
		})
		this._listeners.forEach(([_, e, listener]) => {
			if (e === event) {
				listener(data)
			}
		})
	}
}
