/**
 * Client-side unlock flag for the free lead magnet.
 *
 * This is a friction gate, not a security boundary — the map is free content
 * and deliberately cheap to unlock. Real entitlements live in RLS.
 */
const KEY = "aiil_free_kit_unlocked";

export function markFreeKitUnlocked() {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    /* storage unavailable — ignore */
  }
}

export function isFreeKitUnlocked(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
