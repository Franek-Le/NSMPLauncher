import os from "os";
import path from 'node:path';
import { readdir, readFile, mkdir, stat } from "fs/promises"
import { Account, CrackAuth, Launcher, Config } from "eml-lib";

import { sha256 } from "../shared/sha256";
import { LocalMod } from "../shared/local-mod";

export class Game {
    private launcher: Launcher;
    public root: string;
    private fullroot: string;

    public constructor(username: string, root: string, fullroot: string) {
        this.root = root
        this.fullroot = fullroot

        console.log(this.fullroot)

        const auth = new CrackAuth();
        
        const account: Account = auth.auth(username);

        const ram: number = this.ramAmount();

        const config: Config = {
            root: this.root,
            account: account,
            memory: {
                min: Math.min(2048, ram / 2),
                max: ram,
            },

            minecraft: {
                version: "1.21.1",
                loader: {
                    loader: "neoforge",
                    version: "21.1.233"
                }
            },
            cleaning: {
                enabled: true,
                ignored: [
                    "crash-reports/",
                    "logs/",
                    "resourcepacks/",
                    "resources/",
                    "saves/",
                    "shaderpacks/",
                    "options.txt",
                    "optionsof.txt",
                    "mods/"
                ]
            },
            java: {
                install: "auto",
                args: []
            }
        }

        this.launcher = new Launcher(config);
    }

    public async launch(): Promise<void> {
        await this.launcher.launch();
    }

    public on(name: string, handler: (...args: unknown[]) => void): void {
        this.launcher?.on(name, handler as never);
    }

    public async getMods(): Promise<LocalMod[]> {
        const modFolderPath = path.join(this.fullroot, "mods");

        await mkdir(modFolderPath, { recursive: true});

        const filenames = await readdir(modFolderPath);

        const mods: LocalMod[] = [];

        for (const filename of filenames) {
            const filepath = path.join(modFolderPath, filename);

            const fileStat = await stat(filepath);
            if (!fileStat.isFile()) continue;

            const content = await readFile(filepath);
            const hash = sha256(content);

            mods.push({
                filename,
                sha256: hash,
            });
        }

        return mods;
    }

    private ramAmount(): number {
        const totalRam = os.totalmem();
        const GB = 1024 ** 3;

        if (totalRam <= 4 * GB) return 2 * 1024;
        if (totalRam <= 8 * GB) return 4 * 1024;
        if (totalRam <= 16 * GB) return 6 * 1024;
        if (totalRam <= 32 * GB) return 8 * 1024;
        return 12 * 1024;
    }
}