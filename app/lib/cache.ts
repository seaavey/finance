interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

export function createCache() {
  function fetch<T>(key: string, fetcher: () => Promise<T>, ttlMs = 30_000): Promise<T> {
    const now = Date.now();
    const existing = store.get(key);
    if (existing && existing.expiresAt > now) {
      return Promise.resolve(existing.data as T);
    }

    const pending = inflight.get(key);
    if (pending) {
      return pending as Promise<T>;
    }

    const promise = fetcher().then((data) => {
      store.set(key, { data, expiresAt: now + ttlMs });
      inflight.delete(key);
      return data;
    }).catch((err) => {
      inflight.delete(key);
      throw err;
    });

    inflight.set(key, promise);
    return promise;
  }

  function invalidate(pattern?: string) {
    if (!pattern) {
      store.clear();
      inflight.clear();
      return;
    }
    for (const key of store.keys()) {
      if (key.startsWith(pattern)) {
        store.delete(key);
        inflight.delete(key);
      }
    }
  }

  return { fetch, invalidate };
}

export type Cache = ReturnType<typeof createCache>;
