import { useEffect } from "react";

export function useAsyncEffect(callback: () => Promise<void>, dependencies: any[]) {
    useEffect(() => {
        callback()
    }, dependencies)
}
