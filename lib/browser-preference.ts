// localStorage is an external store. Subscribe instead of copying it into state
// from an effect; provide a stable server snapshot for hydration.
export function createBrowserPreference<T extends string>(
  key: string,
  serverDefault: T,
  isValid: (value: string | null) => value is T,
  browserDefault: () => T = () => serverDefault,
) {
  const eventName = `makaanx-preference:${key}`;
  let unavailableStorageValue: T | undefined;

  function getSnapshot(): T {
    if (typeof window === "undefined") return serverDefault;
    if (unavailableStorageValue !== undefined) return unavailableStorageValue;
    try {
      const value = window.localStorage.getItem(key);
      return isValid(value) ? value : browserDefault();
    } catch {
      return unavailableStorageValue ?? browserDefault();
    }
  }

  return {
    getSnapshot,
    getServerSnapshot: () => serverDefault,
    subscribe(listener: () => void) {
      const onStorage = (event: StorageEvent) => {
        if (event.key === key || event.key === null) { unavailableStorageValue = undefined; listener(); }
      };
      window.addEventListener("storage", onStorage);
      window.addEventListener(eventName, listener);
      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(eventName, listener);
      };
    },
    set(value: T) {
      if (!isValid(value)) return;
      try { window.localStorage.setItem(key, value); unavailableStorageValue = undefined; }
      catch { unavailableStorageValue = value; }
      window.dispatchEvent(new Event(eventName));
    },
  };
}
