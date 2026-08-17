import { z } from "zod";
import { Mod } from "../shared/mod";

const ZodModArray = z.array(z.object({
    name: z.string(),
    filename: z.string(),
    sha256: z.string(),
    url: z.string(),
}))

export class WebServer {
    private readonly url = "https://NSMP-NSMP-Server.hf.space";

    public async getModList(): Promise<Mod[]> {
        const response = await fetch(`${this.url}/mods`);

        if (!response.ok) {
            throw new Error(
                `Failed to fetch mod list: ${response.status} ${response.statusText}`
            );
        }

        const data: unknown = await response.json();

        const result = ZodModArray.safeParse(data);

        return result.data as Mod[];
    }
}
