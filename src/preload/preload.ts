import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

contextBridge.exposeInMainWorld("api", {
    launchGame: (username: string) => ipcRenderer.invoke("launch-game", username),
    onGameEvent: (callback: (name: string, payload: unknown) => void) => {
        const listener = (_event: IpcRendererEvent, name: string, payload: unknown) => callback(name, payload);
        ipcRenderer.on("game-event", listener);
        return () => ipcRenderer.removeListener("game-event", listener);
    }
});