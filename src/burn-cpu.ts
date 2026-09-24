export function burnCpu(time: number) {
    const startTime = Date.now()
    while (Date.now() - startTime < time) ;
}