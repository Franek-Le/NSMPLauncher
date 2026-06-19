import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
    launchGame: (username: string) => ipcRenderer.invoke("launch-game", username)
})