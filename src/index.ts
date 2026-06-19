import { Game } from "./game";
import { Window } from "./window";
import { app } from "electron";

const basePath: string = "../static/"

app.whenReady().then(async () => {
    const window = new Window();
    window.load(basePath + "main.html")

    const game = new Game("Dev");

    game.on('launch_compute_download', () =>
        console.log('Computing download...')
    );

    game.on('launch_download', (d: any) =>
        console.log(`Downloading ${d.total.amount} files...`)
    );

    game.on('launch_install_loader', (l: any) =>
        console.log(`Installing ${l.type} ${l.loaderVersion}...`)
    );

    game.on('launch_check_java', () =>
        console.log('Checking Java...')
    );

    game.on('launch_launch', (info: any) =>
        console.log(`Launching Minecraft ${info.version}...`)
    );

    game.on('launch_data', (msg: any) =>
        process.stdout.write(msg)
    );

    game.on('launch_close', (code: any) =>
        console.log(`Closed with code ${code}.`)
    );

    await game.launch();
});