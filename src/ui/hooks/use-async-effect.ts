import { type DependencyList, useEffect } from "react"

export function useAsyncEffect(callback: () => Promise<void>, dependencies: DependencyList) {
	// biome-ignore lint/correctness/useExhaustiveDependencies: Do not trigger the effect when callback changes.
	useEffect(() => {
		callback()
	}, [...dependencies])
}
