interface PendingRequest<T> {
  resolve: (options: T[]) => void;
  reject: (reason?: unknown) => void;
}

export function createDebouncedLoader<T>(
  loadOptions: (inputValue: string) => Promise<T[]>,
  delayMs: number,
) {
  let currentLoadOptions = loadOptions;
  let requestId = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const pending = new Map<number, PendingRequest<T>>();

  const settle = (id: number, options: T[]) => {
    pending.get(id)?.resolve(options);
    pending.delete(id);
  };

  const cancelPending = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
    for (const id of pending.keys()) settle(id, []);
  };

  return {
    load(inputValue: string): Promise<T[]> {
      cancelPending();
      const id = ++requestId;

      return new Promise<T[]>((resolve, reject) => {
        pending.set(id, { resolve, reject });
        timer = setTimeout(async () => {
          timer = undefined;
          try {
            const options = await currentLoadOptions(inputValue);
            settle(id, id === requestId ? options : []);
          } catch (error) {
            const request = pending.get(id);
            pending.delete(id);
            if (id === requestId) request?.reject(error);
          }
        }, delayMs);
      });
    },
    dispose() {
      ++requestId;
      cancelPending();
    },
    setLoadOptions(nextLoadOptions: (inputValue: string) => Promise<T[]>) {
      currentLoadOptions = nextLoadOptions;
    },
  };
}
