import { Window } from "./window";
import { app, ipcMain } from "electron";
import * as path from "path";
import { fork, ChildProcess } from "child_process";

function getPath(): string {
    if (process.platform == "win32") {
        return app.getPath("appData");
    } else {
        return app.getPath("home");
    }
}

app.whenReady().then(() => {
    const mainWindow = new Window();

    app.getPath("appData");

    ipcMain.handle('launch-game', (_event, username: string) => {
        const workerPath = path.join(__dirname, "../workers/launcherWorker.js");
        let worker: ChildProcess;

        try {
            worker = fork(workerPath, [], { cwd: process.cwd(), env: process.env });
        } catch (e) {
            console.error('Failed to fork launcher worker', e);
            mainWindow.window.webContents.send('game-event', 'launch_error', String(e));
            return false;
        }

        const forward = (name: string, payload?: unknown) => {
            try {
                mainWindow.window.webContents.send('game-event', name, payload);
            } catch (err) {
                console.error('Failed to forward game-event', err);
            }
        };

        worker.on('message', (m: { name?: string; payload?: unknown } | null) => {
            if (!m || typeof m.name !== 'string') return;
            forward(m.name, m.payload);
        });

        worker.on('error', (err) => forward('launch_error', String(err)));

        worker.send({ type: 'start', username: username || 'Dev', root: path.join(getPath(), ".nsmplauncher")});

        return true;
    });
});