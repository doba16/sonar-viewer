export type Recording = {
  name: string,
  startTime: Date,
  duration: number,
  numberOfPings: number
}

export type Recordings = {
  recordings: Recording[],
  filepath: string,
  type: "zip" | "folder"
}
