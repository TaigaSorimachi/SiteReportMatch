import liff from '@line/liff';

const LIFF_ID = import.meta.env.VITE_LIFF_ID || '';

export async function initLiff(): Promise<void> {
  if (!LIFF_ID || LIFF_ID === 'your_liff_id') return;
  await liff.init({ liffId: LIFF_ID });
}

export function getLiffAccessToken(): string | null {
  try {
    return liff.isLoggedIn() ? liff.getAccessToken() : null;
  } catch {
    return null;
  }
}

export function isLiffLoggedIn(): boolean {
  try {
    return liff.isLoggedIn();
  } catch {
    return false;
  }
}

export function liffLogin(): void {
  liff.login();
}
