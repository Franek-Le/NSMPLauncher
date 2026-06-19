import { BrowserWindow } from "electron";



export class Window {
    window: BrowserWindow;

    constructor() {
        this.window = new BrowserWindow({
            width: 1280,
            height: 720,
        })
    }

    public load(path: string) {
        this.window.loadFile(path);
    }
}