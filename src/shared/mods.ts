import path from "node:path";
import { Game } from "../main/game";
import { LocalMod } from "./local-mod";
import { Mod } from "./mod";
import { WebServer } from "../main/server";
import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import { pipeline } from "node:stream/promises";

export interface ModValidationResult {
    mods: Mod[],
    remove: LocalMod[],
}

export class ModManager {
    private game: Game;
    private server: WebServer;
    private root: string;

    constructor(game: Game, server: WebServer, root: string) {
        this.root = root;
        this.game = game;
        this.server = server;
    }

    public async validateMods(): Promise<ModValidationResult> {
        const localMods: LocalMod[] = await this.game.getMods();
        const serverMods: Mod[] = await this.server.getModList();

        const localMap = new Map(localMods.map(m => [m.filename, m]));
        const serverMap = new Map(serverMods.map(m => [m.filename, m]));

        const modsToRedownload: Mod[] = [];
        const modsToRemove: LocalMod[] = [];

        for (const serverMod of serverMods) {
            const localMod = localMap.get(serverMod.filename);

            if (!localMod) {
                modsToRedownload.push(serverMod);
                continue;
            }

            if (serverMod.sha256 !== localMod.sha256) {
                modsToRedownload.push(serverMod);
            }
        }

        for (const localMod of localMods) {
            if (!serverMap.has(localMod.filename)) {
                modsToRemove.push(localMod);
            }
        }

        const result: ModValidationResult = {
            mods: modsToRedownload,
            remove: modsToRemove,
        } as ModValidationResult;

        return result;
    }

    public async downloadMods(mods: Mod[]): Promise<void> {
        for (const mod of mods) {
            await this.downloadMod(mod);
        }
    }

    public async removeMods(mods: LocalMod[]): Promise<void> {
        for (const mod of mods) {
            const fullPath: string = path.join(this.root, "mods", mod.filename);
            if (!(await this.fileExists(fullPath))) {
                continue;
            }
            await fs.unlink(fullPath);
        }
    }

    private async downloadMod(mod: Mod): Promise<void> {
        const response = await fetch(mod.url);

        if (!response.ok || !response.body) {
            throw new Error(`Failed to download ${response.status} ${response.statusText}`);
        }

        const modDir = path.join(this.root, "mods");
        const filePath = path.join(modDir, mod.filename);

        const fileStream = createWriteStream(filePath);

        await pipeline(response.body as any, fileStream);
    }

    private async fileExists(path: string): Promise<boolean> {
        try {
            await fs.access(path);
            return true;
        } catch {
            return false;
        }
    }
}