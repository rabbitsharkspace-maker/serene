import React, { useState, useMemo } from 'react';
import { Users, MapPin, Sparkles, Loader2, Plus, X, Copy, Check, Dices, Utensils } from 'lucide-react';
import { useLocale, getCountryContent } from '../lib/locale';
import GroundingSources, { Grounding } from './GroundingSources';

type Participant = { id: number; name: string; address: string; taste: string };
type Candidate = { name: string; cuisine: string; address: string; priceLevel: string; why: string; mapQuery: string };
type Result = { midpointArea: string; reasoning: string; candidates: Candidate[]; isQuotaFallback?: boolean; _grounding?: Grounding | null };

const TASTE_CHIPS = ['火锅', '川菜', '日料', '韩餐', '越南粉', '西餐', '清真', '清淡', '奶茶'];

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
  const content = getCountryContent(country);
  const spots = DEMO_SPOTS[country] || DEMO_SPOTS.AU;

  const [joinCode] = useState(randomCode);
  const [codeCopied, setCodeCopied] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 1, name: '你', address: spots[0], taste: '火锅' },
    { id: 2, name: '同学小李', address: spots[1], taste: '日料' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  // spinner
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [chosen, setChosen] = useState<number | null>(null);

  const update = (id: number, key: keyof Participant, val: string) =>
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, [key]: val } : p)));
  const addPerson = () =>
    setParticipants((prev) => [...prev, { id: Date.now(), name: `朋友${prev.length + 1}`, address: '', taste: '' }]);
  const removePerson = (id: number) =>
    setParticipants((prev) => (prev.length > 2 ? prev.filter((p) => p.id !== id) : prev));

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
    }, 3600);
  };

  const mapQuery = chosen != null ? candidates[chosen].mapQuery : (result?.midpointArea ? `${result.midpointArea}, ${content.nameZh}` : '');

  return (
    <div className="bg-white border border-hairline rounded-3xl p-6 md:p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-on-primary bg-primary rounded-full px-2.5 py-1 mb-2">
            <Users size={12} /> 拼饭局 · Group Meal
          </div>
          <h3 className="font-display text-2xl md:text-3xl font-extrabold text-ink tracking-tight">开一局拼饭,AI 帮大家定地方</h3>
          <p className="text-sm text-muted mt-1">各填位置+口味 → Gemini 算公平中点、推荐真实餐厅 → 转盘一锤定音。</p>
        </div>
        {/* Join code (Kahoot-style) */}
        <div className="shrink-0 text-center bg-surface-soft border border-hairline rounded-2xl px-4 py-3">
          <div className="text-[10px] font-bold text-muted-soft uppercase tracking-wider">加入码</div>
          <button onClick={copyCode} className="font-mono text-2xl font-black text-ink tracking-[0.2em] flex items-center gap-1.5">
            {joinCode} {codeCopied ? <Check size={15} className="text-success" /> : <Copy size={14} className="text-muted-soft" />}
          </button>
          <div className="text-[10px] text-muted-soft mt-0.5">发给朋友,在 Serene 输入即可加入</div>
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
                <span className="text-[10px] text-muted-soft">{idx === 0 ? '👑 房主' : '已加入'}</span>
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
                  placeholder="你大概在哪(区/街道)"
                  className="bg-transparent text-xs text-body focus:outline-none w-full"
                />
              </div>
              <div className="flex items-center gap-1.5 bg-white border border-hairline rounded-xl px-2.5 py-2">
                <Utensils size={13} className="text-primary shrink-0" />
                <input
                  value={p.taste}
                  onChange={(e) => update(p.id, 'taste', e.target.value)}
                  placeholder="想吃什么口味"
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
          <Plus size={14} /> 模拟好友加入
        </button>
        <button
          onClick={compute}
          disabled={loading}
          className="cta-3d disabled:opacity-60 text-sm font-bold px-5 py-2.5 flex items-center gap-2"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> AI 算局中…</> : <><Sparkles size={16} /> AI 算中点 & 推荐餐厅</>}
        </button>
      </div>

      {error && <p className="text-xs text-error mt-2">算局失败,请确认每人都填了大致位置后重试。</p>}

      {/* Result */}
      {result && (
        <div className="mt-6 pt-6 border-t border-hairline animate-in fade-in slide-in-from-bottom-3 duration-400">
          {result.isQuotaFallback && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-5 text-[11px] text-amber-800 leading-relaxed">
              ⚠️ Google 接口当前繁忙（限流），以下为<strong>预置示例局</strong>（餐厅/中点为示例）。稍后点「AI 算中点」可获取基于你们真实地址的实时推荐。地图仍为真实 Google 地图。
            </div>
          )}
          <div className="bg-primary-soft border border-primary/20 rounded-2xl p-4 mb-5">
            <div className="text-xs font-bold text-ink flex items-center gap-1.5"><MapPin size={14} className="text-primary" /> 公平中点：{result.midpointArea}</div>
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
                    {candidates.length}家
                  </div>
                </div>
                <button onClick={spin} disabled={spinning} className="mt-4 cta-3d disabled:opacity-60 text-sm font-bold px-6 py-2.5 flex items-center gap-2">
                  <Dices size={16} /> {spinning ? '转盘抽签中…' : '转盘一锤定音'}
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
                          {isChosen && <span className="text-[10px] font-black text-primary">· 今晚就它!</span>}
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
                {chosen != null ? `🗺️ ${candidates[chosen].name}` : '🗺️ 中点区域地图'}
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
              <p className="text-[10px] text-muted-soft mt-1.5">实时 Google 地图 · 转盘选定后自动定位到餐厅</p>
            </div>
          </div>

          {result._grounding && <GroundingSources grounding={result._grounding} />}
        </div>
      )}
    </div>
  );
}
