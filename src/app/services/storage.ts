export interface IDoomStorage {
    get: (key: string) => Promise<any>;
    set: (key: string, data: any) => Promise<void>;
}

class ChromeSyncStorage implements IDoomStorage {
    protected cache: {[key: string]: any} = {};

    public get(key: string): Promise<any> {
        return (new Promise((r) =>
            chrome.storage.sync.get([key], (data: any) => r(data[key])))
        );
    }

    public set(key: string, data: any): Promise<void> {
        return new Promise((r) => chrome.storage.sync.set({[key]: data}, r));
    }
}

class LocalStorage implements IDoomStorage {
    public async get(key: string): Promise<any> {
      const val = JSON.parse(window.localStorage.getItem(`doom-taskmanager-extension-${key}`)) || null;
      return Promise.resolve(val);
    }

    public async set(key: string, data: any): Promise<void> {
        window.localStorage.setItem(`doom-taskmanager-extension-${key}`, JSON.stringify(data));
        return Promise.resolve();
    }
}

class TmpStorage implements IDoomStorage {
    protected cache: {[key: string]: any} = {};

    public async get(key: string): Promise<any> {
        return Promise.resolve(this.cache[key] || null);
    }

    public async set(key: string, data: any): Promise<void> {
        this.cache[key] = data;
        return Promise.resolve();
    }
}

export const DoomStorage = new LocalStorage(); // new TmpStorage(); // ChromeSyncStorage();
