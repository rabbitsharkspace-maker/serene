import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Users, MapPin, Sparkles, Loader2, Plus, X, Copy, Check, Dices, Utensils } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useLocale, getCountryContent } from '../lib/locale';
import { useT } from '../lib/i18n';
import {
  getClientId, ensureRoom, participantExists, putParticipant, patchParticipant,
  dropParticipant, putResult, putChosen, watchParticipants, watchRoom,
} from '../lib/meetupService';
import GroundingSources, { Grounding } from './GroundingSources';

type Participant = { id: string; name: string; address: string; taste: string };
type Candidate = { name: string; cuisine: string; address: string; priceLevel: string; why: string; mapQuery: string };
type Result = { midpointArea: string; reasoning: string; candidates: Candidate[]; isQuotaFallback?: boolean; _grounding?: Grounding | null };

// Two well-known areas per country, so the demo works out-of-the-box and stays country-aware.
const DEMO_SPOTS: Record<string, [string, string]> = {
  AU: ['Carlton, Melbourne', 'Clayton, Melbourne'],
  US: ['Brooklyn, New York', 'Flushing, Queens, New York'],
  UK: ['Camden, London', 'Greenwich, London'],
  CA: ['North York, Toronto', 'Scarborough, Toronto'],
};

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function MeetupPlanner() {
  const { country, region, language } = useLocale();
  const t = useT();
  const content = getCountryContent(country);
  const spots = DEMO_SPOTS[country] || DEMO_SPOTS.AU;

  const TASTE_CHIPS = [
    t('mp_taste_hotpot'), t('mp_taste_sichuan'), t('mp_taste_japanese'), t('mp_taste_korean'),
    t('mp_taste_pho'), t('mp_taste_western'), t('mp_taste_halal'), t('mp_taste_light'), t('mp_taste_milktea'),
  ];

  // Room identity: a ?meetup=CODE in the URL joins that room; otherwise we host a new one.
  const urlCode = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const c = new URLSearchParams(window.location.search).get('meetup');
    return c ? c.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) : null;
  }, []);
  const joinedViaUrl = !!urlCode;
  const clientId = useMemo(() => getClientId(), []);
  const [joinCode] = useState(() => urlCode || randomCode());

  // Scannable join link — the QR mirrors the host's real origin (LAN IP / deployed domain),
  // so once you're not on localhost a friend can scan it and land in this same live room.
  const joinUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://serene.app'}/?meetup=${joinCode}`;
  const [codeCopied, setCodeCopied] = useState(false);
  const [synced, setSynced] = useState(false); // true once the Firestore room is live

  const [participants, setParticipants] = useState<Participant[]>(() =>
    joinedViaUrl
      ? [{ id: clientId, name: t('mp_you'), address: '', taste: '' }]
      : [
          { id: clientId, name: t('mp_you'), address: spots[0], taste: t('mp_taste_hotpot') },
          { id: 'sample-friend', name: t('mp_classmate'), address: spots[1], taste: t('mp_taste_japanese') },
        ],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  // spinner
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [chosen, setChosen] = useState<number | null>(null);

  // --- realtime plumbing ---
  const editingIdRef = useRef<string | null>(null);                          // who the local user is typing into
  const editTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const spinningRef = useRef(false);
  useEffect(() => { spinningRef.current = spinning; }, [spinning]);

  // Join/create the room, seed myself, then subscribe to live participants + result/pick.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await ensureRoom(joinCode, clientId);
      if (cancelled) return;
      const mine = await participantExists(joinCode, clientId);
      if (cancelled || mine) return;
      const now = Date.now();
      await putParticipant(joinCode, {
        id: clientId, name: t('mp_you'),
        address: joinedViaUrl ? '' : spots[0],
        taste: joinedViaUrl ? '' : t('mp_taste_hotpot'), joinedAt: now,
      });
      if (!joinedViaUrl) {
        await putParticipant(joinCode, {
          id: 'sample-friend', name: t('mp_classmate'),
          address: spots[1], taste: t('mp_taste_japanese'), joinedAt: now + 1,
        });
      }
    })();

    const unsubParts = watchParticipants(joinCode, (server) => {
      if (cancelled) return;
      setSynced(true);
      if (server.length === 0) return; // brief gap before the seed lands — keep local copy
      setParticipants((prev) => {
        const mapped = server.map(({ id, name, address, taste }) => ({ id, name, address, taste }));
        const editId = editingIdRef.current;
        if (!editId) return mapped;
        const localEditing = prev.find((p) => p.id === editId); // don't clobber in-progress typing
        return localEditing ? mapped.map((p) => (p.id === editId ? localEditing : p)) : mapped;
      });
    }, () => setSynced(false));

    const unsubRoom = watchRoom(joinCode, (data) => {
      if (cancelled || !data) return;
      if ('result' in data) setResult((data.result as Result) ?? null);
      if ('chosen' in data && !spinningRef.current) setChosen(data.chosen ?? null);
    }, () => {});

    return () => {
      cancelled = true;
      unsubParts(); unsubRoom();
      Object.values(editTimers.current).forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joinCode]);

  const update = (id: string, key: keyof Participant, val: string) => {
    editingIdRef.current = id;
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, [key]: val } : p)));
    clearTimeout(editTimers.current[id]);
    editTimers.current[id] = setTimeout(() => {
      setParticipants((cur) => {
        const p = cur.find((x) => x.id === id);
        if (p) patchParticipant(joinCode, id, { name: p.name, address: p.address, taste: p.taste });
        return cur;
      });
      if (editingIdRef.current === id) editingIdRef.current = null;
    }, 450);
  };
  const addPerson = () => {
    const id = `sim-${Date.now()}`;
    const name = t('mp_friend_n', { n: participants.length + 1 });
    setParticipants((prev) => [...prev, { id, name, address: '', taste: '' }]);
    putParticipant(joinCode, { id, name, address: '', taste: '', joinedAt: Date.now() });
  };
  const removePerson = (id: string) => {
    if (participants.length <= 1) return;
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    dropParticipant(joinCode, id);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(joinCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 1500);
  };

  const compute = async () => {
    setLoading(true);
    setError(false);
    setResult(null);
    setChosen(null);
    try {
      const res = await fetch('/api/meetup-spot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country, region, language, participants }),
      });
      if (!res.ok) throw new Error('failed');
      const d: Result = await res.json();
      if (!d.candidates?.length) throw new Error('empty');
      setResult(d);
      putResult(joinCode, d, null); // share candidates with everyone in the room
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const candidates = result?.candidates || [];
  const segAngle = candidates.length ? 360 / candidates.length : 90;
  const wheelGradient = useMemo(() => {
    if (!candidates.length) return 'var(--color-surface-soft)';
    const palette = ['#f1583a', '#e8a55a', '#5db8a6', '#b06a3a', '#d8462a', '#c2820a'];
    const stops = candidates
      .map((_, i) => `${palette[i % palette.length]} ${i * segAngle}deg ${(i + 1) * segAngle}deg`)
      .join(', ');
    return `conic-gradient(${stops})`;
  }, [candidates, segAngle]);

  const spin = () => {
    if (spinning || !candidates.length) return;
    setSpinning(true);
    setChosen(null);
    const target = Math.floor(Math.random() * candidates.length);
    // rotate so target segment's centre lands under the top pointer
    const dest = 360 * 6 + (360 - (target * segAngle + segAngle / 2));
    setAngle((prev) => prev - (prev % 360) + dest);
    setTimeout(() => {
      setChosen(target);
      setSpinning(false);
      putChosen(joinCode, target); // everyone in the room sees the same pick
    }, 3600);
  };

  const mapQuery = chosen != null ? candidates[chosen].mapQuery : (result?.midpointArea ? `${result.midpointArea}, ${content.nameZh}` : '');

  return (
    <div className="bg-white border border-hairline rounded-3xl p-6 md:p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-on-primary bg-primary rounded-full px-2.5 py-1 mb-2">
            <Users size={12} /> {t('mp_badge')}
          </div>
          <h3 className="font-display text-2xl md:text-3xl font-extrabold text-ink tracking-tight">{t('mp_title')}</h3>
          <p className="text-sm text-muted mt-1">{t('mp_subtitle')}</p>
        </div>
        {/* Join code (Kahoot-style) */}
        <div className="shrink-0 text-center bg-surface-soft border border-hairline rounded-2xl px-4 py-3">
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-muted-soft uppercase tracking-wider">
            {t('mp_join_code')}
            {synced && (
              <span className="inline-flex items-center gap-1 text-success normal-case tracking-normal">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> {t('mp_live')}
              </span>
            )}
          </div>
          <button onClick={copyCode} className="font-mono text-2xl font-black text-ink tracking-[0.2em] flex items-center gap-1.5 mx-auto">
            {joinCode} {codeCopied ? <Check size={15} className="text-success" /> : <Copy size={14} className="text-muted-soft" />}
          </button>
          {/* Scannable join QR — scan to land in Serene with this code prefilled */}
          <a href={joinUrl} target="_blank" rel="noreferrer" title={joinUrl} className="block mt-2 mx-auto w-fit rounded-xl bg-white p-2 border border-hairline shadow-sm transition-transform hover:scale-105 active:scale-95">
            <QRCodeSVG value={joinUrl} size={84} level="M" bgColor="#ffffff" fgColor="#221c15" />
          </a>
          <div className="text-[10px] font-bold text-ink mt-1.5">{t('mp_scan_join')}</div>
          <div className="text-[10px] text-muted-soft mt-0.5">{t('mp_join_hint')}</div>
        </div>
      </div>

      {/* Participants */}
      <div className="space-y-3 mb-4">
        {participants.map((p, idx) => (
          <div key={p.id} className="bg-surface-soft/60 border border-hairline rounded-2xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <input
                value={p.name}
                onChange={(e) => update(p.id, 'name', e.target.value)}
                className="bg-transparent font-bold text-ink text-sm focus:outline-none w-32"
              />
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-soft">{idx === 0 ? t('mp_host') : t('mp_joined')}</span>
                {participants.length > 2 && (
                  <button onClick={() => removePerson(p.id)} className="text-muted-soft hover:text-error"><X size={14} /></button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5 bg-white border border-hairline rounded-xl px-2.5 py-2">
                <MapPin size={13} className="text-primary shrink-0" />
                <input
                  value={p.address}
                  onChange={(e) => update(p.id, 'address', e.target.value)}
                  placeholder={t('mp_addr_placeholder')}
                  className="bg-transparent text-xs text-body focus:outline-none w-full"
                />
              </div>
              <div className="flex items-center gap-1.5 bg-white border border-hairline rounded-xl px-2.5 py-2">
                <Utensils size={13} className="text-primary shrink-0" />
                <input
                  value={p.taste}
                  onChange={(e) => update(p.id, 'taste', e.target.value)}
                  placeholder={t('mp_taste_placeholder')}
                  className="bg-transparent text-xs text-body focus:outline-none w-full"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {TASTE_CHIPS.slice(0, 6).map((t) => (
                <button
                  key={t}
                  onClick={() => update(p.id, 'taste', t)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${p.taste === t ? 'bg-primary text-on-primary border-primary' : 'bg-white text-muted border-hairline hover:border-primary'}`}
                >{t}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-2">
        <button onClick={addPerson} className="text-xs font-bold text-ink bg-surface-soft border border-hairline rounded-full px-3.5 py-2 hover:border-primary flex items-center gap-1">
          <Plus size={14} /> {t('mp_add_friend')}
        </button>
        <button
          onClick={compute}
          disabled={loading}
          className="cta-3d disabled:opacity-60 text-sm font-bold px-5 py-2.5 flex items-center gap-2"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> {t('mp_computing')}</> : <><Sparkles size={16} /> {t('mp_compute_btn')}</>}
        </button>
      </div>

      {error && <p className="text-xs text-error mt-2">{t('mp_compute_fail')}</p>}

      {/* Result */}
      {result && (
        <div className="mt-6 pt-6 border-t border-hairline animate-in fade-in slide-in-from-bottom-3 duration-400">
          {result.isQuotaFallback && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-5 text-[11px] text-amber-800 leading-relaxed">
              {t('mp_fallback')}
            </div>
          )}
          <div className="bg-primary-soft border border-primary/20 rounded-2xl p-4 mb-5">
            <div className="text-xs font-bold text-ink flex items-center gap-1.5"><MapPin size={14} className="text-primary" /> {t('mp_fair_midpoint')}{result.midpointArea}</div>
            <p className="text-xs text-body mt-1 leading-relaxed">{result.reasoning}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: spinner + candidates */}
            <div>
              <div className="flex flex-col items-center mb-5">
                <div className="relative" style={{ width: 220, height: 220 }}>
                  {/* pointer */}
                  <div className="absolute left-1/2 -translate-x-1/2 -top-1 z-10 text-primary text-2xl leading-none">▼</div>
                  <div
                    className="w-full h-full rounded-full border-4 border-white shadow-lg"
                    style={{
                      background: wheelGradient,
                      transform: `rotate(${angle}deg)`,
                      transition: spinning ? 'transform 3.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
                    }}
                  />
                  <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white shadow flex items-center justify-center text-[10px] font-black text-ink" style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
                    {t('mp_n_places', { n: candidates.length })}
                  </div>
                </div>
                <button onClick={spin} disabled={spinning} className="mt-4 cta-3d disabled:opacity-60 text-sm font-bold px-6 py-2.5 flex items-center gap-2">
                  <Dices size={16} /> {spinning ? t('mp_spinning') : t('mp_spin_btn')}
                </button>
              </div>

              <div className="space-y-2.5">
                {candidates.map((c, i) => {
                  const isChosen = chosen === i;
                  return (
                    <div key={i} className={`rounded-2xl border p-3.5 transition-all ${isChosen ? 'border-primary bg-primary-soft ring-2 ring-primary/30' : 'border-hairline bg-white'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-ink flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full text-[9px] flex items-center justify-center text-white" style={{ background: ['#f1583a', '#e8a55a', '#5db8a6', '#b06a3a', '#d8462a', '#c2820a'][i % 6] }}>{i + 1}</span>
                          {c.name}
                          {isChosen && <span className="text-[10px] font-black text-primary">{t('mp_tonight_pick')}</span>}
                        </span>
                        <span className="text-[10px] text-muted-soft shrink-0">{c.cuisine} · {c.priceLevel}</span>
                      </div>
                      <p className="text-[11px] text-muted mt-1 leading-normal">{c.why}</p>
                      <p className="text-[10px] text-muted-soft mt-0.5">📍 {c.address}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: live Google Map */}
            <div className="flex flex-col">
              <div className="text-[10px] font-bold text-muted-soft uppercase tracking-wider mb-1.5">
                {chosen != null ? `🗺️ ${candidates[chosen].name}` : t('mp_midpoint_map')}
              </div>
              <div className="flex-1 min-h-[300px] rounded-2xl overflow-hidden border border-hairline bg-surface-soft">
                {mapQuery ? (
                  <iframe
                    title="meetup-map"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                    className="w-full h-full"
                    style={{ border: 0, minHeight: 300 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : null}
              </div>
              <p className="text-[10px] text-muted-soft mt-1.5">{t('mp_map_caption')}</p>
            </div>
          </div>

          {result._grounding && <GroundingSources grounding={result._grounding} />}
        </div>
      )}
    </div>
  );
}
