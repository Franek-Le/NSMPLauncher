import os from "os";

import { Account, CrackAuth, Launcher, Config } from "eml-lib";

export class Game {
    private launcher: Launcher;

    public constructor(username: string) {
        const auth = new CrackAuth();

        const account: Account = auth.auth(username);

        const ram: number = this.ramAmount();
        console.log(ram)

        const config: Config = {
            root: "NSMP-2",
            account: account,
            memory: {
                min: ram,
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
                args: [

                ]
            }
            }

        this.launcher = new Launcher(config);
    }

    public async launch(): Promise<void> {
        await this.launcher.launch();
    }

    public on(name: string, handler: (...args: any[]) => void): void {
        this.launcher?.on(name, handler as never);
    }

    private ramAmount(): number {
        const totalRam = os.totalmem();
        const GB = 1024 ** 3;

        if (totalRam <= 4 * GB) return 2;
        if (totalRam <= 8 * GB) return 4;
        if (totalRam <= 16 * GB) return 6;
        if (totalRam <= 32 * GB) return 8;
        return 12;
    }
}