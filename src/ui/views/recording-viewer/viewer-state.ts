import { useState, type DependencyList } from "react";
import { useAsyncEffect } from "../../hooks/useAsyncEffect";

export function shallowEqual<T extends Record<string, number | string | boolean> | undefined>(a: T, b: T) {
    if (a === b) {
        return true
    }
    if (a === undefined || b === undefined) {
        return false
    }
    for (let prop in a) {
        if (a[prop] !== b[prop]) {
            return false
        }
    }
    return true
}

export function arrayEqual(arr1: DependencyList, arr2: DependencyList) {
    if (arr1.length !== arr2.length) return false

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false
    }

    return true
}

export function useViewerState<T extends Record<string, number | string | boolean>>(loadView: (desiredState: T) => Promise<void>, targetState: T, dependencies: DependencyList) {
    const [refreshing, setRefreshing] = useState(false)

    const [currentState, setCurrentState] = useState<T | undefined>(undefined)
    const [currentDependencies, setCurrentDependencies] = useState(dependencies)

    useAsyncEffect(async () => {
        // Do not request a new load while already loading, or if target state is reached.
        if ((shallowEqual(currentState, targetState) && arrayEqual(dependencies, currentDependencies)) || refreshing === true) {
            return
        }

        // State not at target, loading required
        setRefreshing(true)

        // Trigger load
        await loadView(targetState)
        
        // Set next state
        setCurrentState(targetState)
        setRefreshing(false)
        setCurrentDependencies(dependencies)
    }, [refreshing, currentDependencies, dependencies])

    return {
        refreshing,
        currentState
    }
}