import { Game } from "../main/game";
import { ModManager, ModValidationResult } from "../shared/mods";
import { WebServer } from "../main/server";

type StartMessage = { type: 'start'; username: string, root: string};

process.on('message', async (msg: StartMessage | unknown) => {
    if (typeof msg !== 'object' || msg === null) return;
    const maybe = msg as StartMessage;
    if (maybe.type !== 'start') return;

    console.log(process.env.APPDATA);

    const username = maybe.username || 'Player';
    const game = new Game(username, "nsmplauncher", maybe.root);
    const server = new WebServer();
    const modManager = new ModManager(game, server, maybe.root);

    const forward = (name: string, payload?: unknown) => {
        if (process.send) process.send({ name, payload });
    };

    game.on('launch_compute_download', () => forward('launch_compute_download'));
    game.on('launch_download', (d: unknown) => forward('launch_download', d));
    game.on('launch_install_loader', (l: unknown) => forward('launch_install_loader', l));
    game.on('launch_check_java', () => forward('launch_check_java'));
    game.on('launch_launch', (info: unknown) => forward('launch_launch', info));
    game.on('launch_data', (msg: unknown) => forward('launch_data', msg));
    game.on('launch_close', (code: unknown) => forward('launch_close', code));

    const result: ModValidationResult = await modManager.validateMods();
    await modManager.downloadMods(result.mods);
    await modManager.removeMods(result.remove);

    Promise.resolve()
        .then(() => game.launch())
        .catch(err => forward('launch_error', String(err)))
        .finally(() => {
            process.exit(0);
        });
});
