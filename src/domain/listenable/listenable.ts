export type ListenerId = Symbol

export type ListenableEvents = Record<string, any>

type Listener<T> = (data: T) => void

type WildcardListener<L extends ListenableEvents> = (event: keyof L, data: L[keyof L]) => void

export interface Listenable<L extends ListenableEvents> {

    addListener<E extends keyof L>(event: E, listener: Listener<L[E]>): ListenerId

    addWildcardListener(listener: WildcardListener<L>): ListenerId

    removeEventListener(...listenerIds: ListenerId[]): void

}

export class DefaultListenable<L extends ListenableEvents> implements Listenable<L> {
    
    private _listeners = [] as [ListenerId, keyof L, Listener<any>][]
    private _wildcardListeners = new Map<ListenerId, WildcardListener<L>>()
    
    addListener<E extends keyof L>(event: E, listener: Listener<L[E]>): ListenerId {
        const id = Symbol()
        this._listeners.push([id, event, listener])
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
        this._wildcardListeners.forEach(listener => listener(event, data))
        this._listeners.forEach(([_, e, listener]) => {
            if (e === event) {
                listener(data)
            }
        })
    }
    
}

/*type MyEvents = {
    foo: string,
    bar: number
}

class TestFoo extends DefaultListenable<MyEvents> {

    foo() {
        this.publishEvent("foo", "hoo")
    }

    bar() {
        this.publishEvent("bar", 123)
    }

}

const t = new TestFoo()

const l1 = t.addListener("foo", (d) => {
    console.log("Foo-Event:", d, typeof d)
})

const l2 = t.addListener("bar", (d) => {
    console.log("Bar-Event:", d, typeof d)
})

const l3 = t.addWildcardListener((event, data) => {
    console.log("Wildcard-Event:", event, data,  typeof data)
})

t.foo()
t.bar()

t.removeEventListener(l1)
console.log("Remove 1")

t.foo()
t.bar()

t.removeEventListener(l2)
console.log("Remove 2")

t.foo()
t.bar()

t.removeEventListener(l3)
console.log("Remove 3")

t.foo()
t.bar()*/