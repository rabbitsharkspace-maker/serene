// Real-time shared meetup rooms, backed by Firestore (already configured in firebase.ts).
// Model:
//   meetups/{code}                      → { hostId, createdAt, result, chosen }
//   meetups/{code}/participants/{id}    → { name, address, taste, joinedAt }
// Join is login-free: a friend scans the QR (…/?meetup=CODE) and subscribes to the same room.
// Every call is wrapped so a denied/offline Firestore never crashes the planner — the UI
// falls back to local-only mode and keeps working.
import { db } from './firebase';
import {
  doc, getDoc, setDoc, deleteDoc, onSnapshot, collection, serverTimestamp,
} from 'firebase/firestore';

export type RoomParticipant = {
  id: string;
  name: string;
  address: string;
  taste: string;
  joinedAt: number;
};

// Log each distinct failure once so a denied/offline Firestore doesn't spam the console.
const warned = new Set<string>();
function warnOnce(tag: string, e: unknown) {
  if (warned.has(tag)) return;
  warned.add(tag);
  console.warn(`[meetup] ${tag} (local-only fallback):`, e);
}

const roomRef = (code: string) => doc(db, 'meetups', code);
const partsRef = (code: string) => collection(db, 'meetups', code, 'participants');
const partRef = (code: string, id: string) => doc(db, 'meetups', code, 'participants', id);

// Stable per-device identity so a person edits/owns their own participant across refreshes.
export function getClientId(): string {
  const KEY = 'serene_client_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = (crypto.randomUUID?.() ?? `c-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem(KEY, id);
  }
  return id;
}

export async function ensureRoom(code: string, hostId: string): Promise<void> {
  try {
    await setDoc(roomRef(code), { hostId, createdAt: serverTimestamp() }, { merge: true });
  } catch (e) { warnOnce('ensureRoom', e); }
}

export async function participantExists(code: string, id: string): Promise<boolean> {
  try {
    const snap = await getDoc(partRef(code, id));
    return snap.exists();
  } catch { return false; }
}

export async function putParticipant(code: string, p: RoomParticipant): Promise<void> {
  try {
    await setDoc(
      partRef(code, p.id),
      { name: p.name, address: p.address, taste: p.taste, joinedAt: p.joinedAt },
      { merge: true },
    );
  } catch (e) { warnOnce('putParticipant', e); }
}

// Field-level edit (name/address/taste) that intentionally leaves joinedAt untouched,
// so typing never reshuffles the participant order.
export async function patchParticipant(
  code: string,
  id: string,
  fields: Partial<Pick<RoomParticipant, 'name' | 'address' | 'taste'>>,
): Promise<void> {
  try { await setDoc(partRef(code, id), fields, { merge: true }); }
  catch (e) { warnOnce('patchParticipant', e); }
}

export async function dropParticipant(code: string, id: string): Promise<void> {
  try { await deleteDoc(partRef(code, id)); }
  catch (e) { warnOnce('dropParticipant', e); }
}

// Firestore rejects `undefined`; round-trip to drop undefined fields before writing.
const clean = (v: unknown) => JSON.parse(JSON.stringify(v ?? null));

export async function putResult(code: string, result: unknown, chosen: number | null): Promise<void> {
  try { await setDoc(roomRef(code), { result: clean(result), chosen: chosen ?? null }, { merge: true }); }
  catch (e) { warnOnce('putResult', e); }
}

export async function putChosen(code: string, chosen: number | null): Promise<void> {
  try { await setDoc(roomRef(code), { chosen: chosen ?? null }, { merge: true }); }
  catch (e) { warnOnce('putChosen', e); }
}

// Subscriptions return an unsubscribe fn. onError → call onFail so the UI drops to local mode.
export function watchParticipants(
  code: string,
  onChange: (list: RoomParticipant[]) => void,
  onFail: () => void,
): () => void {
  try {
    return onSnapshot(
      partsRef(code),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RoomParticipant, 'id'>) }));
        list.sort((a, b) => (a.joinedAt ?? 0) - (b.joinedAt ?? 0));
        onChange(list);
      },
      (e) => { warnOnce('participants-subscription', e); onFail(); },
    );
  } catch (e) { warnOnce('participants-subscription', e); onFail(); return () => {}; }
}

export function watchRoom(
  code: string,
  onChange: (data: { result?: unknown; chosen?: number | null } | null) => void,
  onFail: () => void,
): () => void {
  try {
    return onSnapshot(
      roomRef(code),
      (snap) => onChange((snap.data() as { result?: unknown; chosen?: number | null }) ?? null),
      (e) => { warnOnce('room-subscription', e); onFail(); },
    );
  } catch (e) { warnOnce('room-subscription', e); onFail(); return () => {}; }
}
