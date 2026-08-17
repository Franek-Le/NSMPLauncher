class Renderer {
    private usernameInput: HTMLInputElement | null;
    private launchBtn: HTMLButtonElement | null;
    private statusEl: HTMLDivElement | null;
    private progressEl: HTMLProgressElement | null;

    constructor() {
        this.usernameInput = document.getElementById('username') as HTMLInputElement;
        this.launchBtn = document.getElementById('launch') as HTMLButtonElement;
        this.statusEl = document.getElementById('status') as HTMLDivElement;
        this.progressEl = document.getElementById('progress') as HTMLProgressElement;

        this.bind();
    }

    append(msg: string) {
        if (!this.statusEl) return;
        this.statusEl.textContent += msg + '\n';
        this.statusEl.scrollTop = this.statusEl.scrollHeight;
    }

    bind() {
        this.launchBtn?.addEventListener('click', () => void this.onLaunch());
    }

    async onLaunch() {
        const username = this.usernameInput?.value || 'Dev';

        this.append('Preparing to launch for ' + username + '...');

        if (this.launchBtn) this.launchBtn.disabled = true;
        if (this.usernameInput) this.usernameInput.disabled = true;
        if (this.progressEl) this.progressEl.value = 5;

        try {
            await window.api.launchGame(username);

            this.append('Launch started. Waiting for game events...');
            if (this.progressEl) this.progressEl.value = 30;
        } catch (e) {
            this.append('Launch failed: ' + String(e));

            if (this.launchBtn) this.launchBtn.disabled = false;
            if (this.usernameInput) this.usernameInput.disabled = false;
        }
    }

    handleGameEvent(name: string, payload: any) {
        switch (name) {
            case 'launch_data':
                this.append(String(payload));
                if (this.progressEl)
                    this.progressEl.value = Math.min(100, (this.progressEl.value || 0) + 2);
                break;

            case 'launch_download':
                this.append('Downloading files...');
                if (this.progressEl) this.progressEl.value = 40;
                break;

            case 'launch_install_loader':
                this.append('Installing loader...');
                if (this.progressEl) this.progressEl.value = 60;
                break;

            case 'launch_launch':
                this.append('Launching Minecraft...');
                if (this.progressEl) this.progressEl.value = 85;
                break;

            case 'launch_close':
                this.append('Closed with code ' + payload);
                if (this.progressEl) this.progressEl.value = 100;
                this.resetUI();
                break;

            case 'launch_error':
                this.append('Error: ' + payload);
                this.resetUI();
                break;

            default:
                this.append(name + ': ' + JSON.stringify(payload));
        }
    }

    resetUI() {
        if (this.launchBtn) this.launchBtn.disabled = false;
        if (this.usernameInput) this.usernameInput.disabled = false;
    }

    start() {
        if (window.api?.onGameEvent) {
            window.api.onGameEvent((name, payload) => {
                this.handleGameEvent(name, payload);
            });
        }
    }
}

function bootRenderer() {
    const renderer = new Renderer();
    renderer.start();
}

if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootRenderer);
    } else {
        bootRenderer();
    }
}