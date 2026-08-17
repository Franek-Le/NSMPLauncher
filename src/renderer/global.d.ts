export {};

declare global {
    interface Window {
        api: {
            launchGame(username: string): Promise<void>;
            onGameEvent(cb: (name: string, payload: unknown) => void): void;
        };
    }
}