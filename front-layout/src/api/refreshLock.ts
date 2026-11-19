// The refresh cookie is shared by every tab and the backend rotates it on each use, so
// two tabs refreshing at the same time sent the same cookie: one won and the others got
// 401 and were sent to the login. A cross-tab lock makes them take turns; the next tab
// refreshes with the cookie the previous one already rotated.
export const REFRESH_LOCK_NAME = 'agenda-auth-refresh';

export interface LockManagerLike {
  request<T>(name: string, callback: () => Promise<T>): Promise<T>;
}

function browserLocks(): LockManagerLike | undefined {
  const locks = (globalThis.navigator as Navigator | undefined)?.locks;
  return locks ? (locks as unknown as LockManagerLike) : undefined;
}

export function withRefreshLock<T>(
  refresh: () => Promise<T>,
  locks: LockManagerLike | undefined = browserLocks(),
): Promise<T> {
  // Browsers without Web Locks (old Safari) keep the previous behavior.
  if (!locks) return refresh();
  return locks.request(REFRESH_LOCK_NAME, refresh);
}
