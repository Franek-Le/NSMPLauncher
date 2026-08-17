import { BrowserWindow } from "electron";
import * as path from "path";

export class Window {
    window: BrowserWindow;

    constructor() {
        const preloadPath = path.join(__dirname, "..", "preload", "preload.js");
        this.window = new BrowserWindow({
            width: 1280,
            height: 720,
            icon: path.join(__dirname, "../assets/icon.png"),
            webPreferences: {
                preload: preloadPath,
                contextIsolation: true,
                nodeIntegration: false,
            }
        });

        this.window.removeMenu();

        const isDev = !!process.env.VITE_DEV_SERVER_URL;
        const rendererPath = path.join(__dirname, "..", "renderer", "index.html");

        if (isDev) {
            this.loadURL(process.env.VITE_DEV_SERVER_URL!);
        } else {
            this.load(rendererPath);
        }
    }

    public load(p: string): void {
        this.window.loadFile(p);
    }

    public loadURL(url: string): void {
        this.window.loadURL(url);
    }
}