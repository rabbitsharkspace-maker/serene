import React, { useState, useEffect, useMemo } from 'react';
import { Plane, PackageOpen, Plus, MapPin, Calendar, Weight, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useT, type StringKey } from '../lib/i18n';

/**
 * 代购带货 · 人肉快递 (peer-courier board)
 * Travelers flying China→overseas list spare luggage (self-set ¥/kg);
 * requesters post wanted-from-China items (self-set reward). Self-contained
 * concept demo — sample data + localStorage, NO real payment / no backend.
 */

type Kind = 'trip' | 'request';

interface DaigouPost {
  id: string;
  kind: Kind;
  user: string;
  avatar: string;
  // trip
  fromCity?: string;
  toCity?: string;
  date?: string;
  kg?: number;
  pricePerKg?: number;
  // request
  item?: string;
  weightKg?: number;
  reward?: number;
  currency: string;   // the poster sets their own currency
  note?: string;
  createdAt: number;
}

const CURRENCIES = ['¥', 'A$', 'US$', '£', 'NZ$', 'C$'];

type TFn = (key: StringKey, vars?: Record<string, string | number>) => string;

const buildDefaultPosts = (t: TFn): DaigouPost[] => [
  { id: 't1', kind: 'trip', user: t('dg_s_t1_user'), avatar: '🧳', fromCity: t('dg_s_t1_from'), toCity: t('dg_s_t1_to'), date: t('dg_s_t1_date'), kg: 8, pricePerKg: 80, currency: '¥', note: t('dg_s_t1_note'), createdAt: Date.now() - 3600_000 },
  { id: 't2', kind: 'trip', user: t('dg_s_t2_user'), avatar: '✈️', fromCity: t('dg_s_t2_from'), toCity: t('dg_s_t2_to'), date: t('dg_s_t2_date'), kg: 5, pricePerKg: 100, currency: '¥', note: t('dg_s_t2_note'), createdAt: Date.now() - 7200_000 },
  { id: 'r1', kind: 'request', user: t('dg_s_r1_user'), avatar: '🍜', item: t('dg_s_r1_item'), weightKg: 3, reward: 120, currency: '¥', note: t('dg_s_r1_note'), createdAt: Date.now() - 1800_000 },
  { id: 'r2', kind: 'request', user: t('dg_s_r2_user'), avatar: '💊', item: t('dg_s_r2_item'), weightKg: 1, reward: 60, currency: '¥', note: t('dg_s_r2_note'), createdAt: Date.now() - 900_000 },
];

export default function DaigouBoard() {
  const t = useT();
  const [posts, setPosts] = useState<DaigouPost[]>(() => {
    try {
      const saved = localStorage.getItem('serene_eco_daigou');
      if (saved) return JSON.parse(saved);
    } catch {}
    return buildDefaultPosts(t);
  });
  const [filter, setFilter] = useState<'all' | Kind>('all');
  const [showForm, setShowForm] = useState(false);
  const [draftKind, setDraftKind] = useState<Kind>('trip');

  // form fields
  const [fFrom, setFFrom] = useState('');
  const [fTo, setFTo] = useState('');
  const [fDate, setFDate] = useState('');
  const [fKg, setFKg] = useState('');
  const [fItem, setFItem] = useState('');
  const [fWeight, setFWeight] = useState('');
  const [fPrice, setFPrice] = useState('');
  const [fCurrency, setFCurrency] = useState('¥');
  const [fNote, setFNote] = useState('');

  useEffect(() => {
    try { localStorage.setItem('serene_eco_daigou', JSON.stringify(posts)); } catch {}
  }, [posts]);

  const visible = useMemo(
    () => posts.filter(p => filter === 'all' || p.kind === filter).sort((a, b) => b.createdAt - a.createdAt),
    [posts, filter]
  );

  // Local, no-API fair-reward hint so the user has an anchor before setting their own price.
  const suggested = useMemo(() => {
    const w = parseFloat(draftKind === 'trip' ? fKg : fWeight);
    if (!w || w <= 0) return null;
    const low = Math.round(w * 30);
    const high = Math.round(w * 60);
    return `${low}–${high}`;
  }, [draftKind, fKg, fWeight]);

  const resetForm = () => {
    setFFrom(''); setFTo(''); setFDate(''); setFKg(''); setFItem(''); setFWeight(''); setFPrice(''); setFCurrency('¥'); setFNote('');
  };

  const canSubmit = () => {
    if (!fPrice || parseFloat(fPrice) <= 0) return false;
    return draftKind === 'trip' ? !!(fFrom && fTo && fKg) : !!(fItem && fWeight);
  };

  const submit = () => {
    if (!canSubmit()) return;
    const base = { id: `u${Date.now()}`, user: t('dg_me'), avatar: '🙋', currency: fCurrency, note: fNote.trim(), createdAt: Date.now() };
    const post: DaigouPost = draftKind === 'trip'
      ? { ...base, kind: 'trip', fromCity: fFrom.trim(), toCity: fTo.trim(), date: fDate.trim() || t('dg_tbd'), kg: parseFloat(fKg), pricePerKg: parseFloat(fPrice) }
      : { ...base, kind: 'request', item: fItem.trim(), weightKg: parseFloat(fWeight), reward: parseFloat(fPrice) };
    setPosts(prev => [post, ...prev]);
    resetForm();
    setShowForm(false);
    setFilter(draftKind);
  };

  const tripCount = posts.filter(p => p.kind === 'trip').length;
  const reqCount = posts.filter(p => p.kind === 'request').length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-snow rounded-[28px] border border-hairline p-6 md:p-8 mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 bg-surface-soft text-ink px-3 py-1 rounded-full text-xs font-black tracking-wide">
            <Plane size={14} /> {t('dg_badge')}
          </span>
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-[11px] font-bold">{t('dg_concept')}</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight mb-2">{t('dg_title')}</h2>
        <p className="text-sm text-muted leading-relaxed max-w-2xl">
          {t('dg_desc_pre')}
          <strong className="text-ink">{t('dg_desc_bold')}</strong>{t('dg_desc_post')}
        </p>
      </div>

      {/* Filter + publish */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex bg-surface-soft rounded-full p-1">
          {([['all', t('dg_filter_all', { n: tripCount + reqCount })], ['trip', t('dg_filter_trip', { n: tripCount })], ['request', t('dg_filter_request', { n: reqCount })]] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filter === k ? 'bg-ink text-on-dark shadow-sm' : 'text-muted hover:text-ink'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setShowForm(v => !v); setDraftKind(filter === 'request' ? 'request' : 'trip'); }}
          className="cta-3d inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold"
        >
          <Plus size={16} /> {t('dg_publish_one')}
        </button>
      </div>

      {/* Publish form */}
      {showForm && (
        <div className="bg-snow rounded-[28px] border border-hairline p-6 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex bg-surface-soft rounded-full p-1">
              <button onClick={() => setDraftKind('trip')} className={`px-4 py-1.5 rounded-full text-xs font-bold ${draftKind === 'trip' ? 'bg-primary text-on-primary' : 'text-muted'}`}>{t('dg_can_carry_tab')}</button>
              <button onClick={() => setDraftKind('request')} className={`px-4 py-1.5 rounded-full text-xs font-bold ${draftKind === 'request' ? 'bg-primary text-on-primary' : 'text-muted'}`}>{t('dg_want_tab')}</button>
            </div>
            <button onClick={() => setShowForm(false)} className="text-muted hover:text-ink"><X size={18} /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {draftKind === 'trip' ? (
              <>
                <input value={fFrom} onChange={e => setFFrom(e.target.value)} placeholder={t('dg_ph_from')} className="bg-surface-soft border border-hairline rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:border-primary" />
                <input value={fTo} onChange={e => setFTo(e.target.value)} placeholder={t('dg_ph_to')} className="bg-surface-soft border border-hairline rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:border-primary" />
                <input value={fDate} onChange={e => setFDate(e.target.value)} placeholder={t('dg_ph_date')} className="bg-surface-soft border border-hairline rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:border-primary" />
                <input value={fKg} onChange={e => setFKg(e.target.value)} type="number" placeholder={t('dg_ph_kg')} className="bg-surface-soft border border-hairline rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:border-primary" />
              </>
            ) : (
              <>
                <input value={fItem} onChange={e => setFItem(e.target.value)} placeholder={t('dg_ph_item')} className="md:col-span-2 bg-surface-soft border border-hairline rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:border-primary" />
                <input value={fWeight} onChange={e => setFWeight(e.target.value)} type="number" placeholder={t('dg_ph_weight')} className="bg-surface-soft border border-hairline rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:border-primary" />
              </>
            )}

            {/* The star field: user sets their own price AND their own currency */}
            <div className={`${draftKind === 'request' ? '' : 'md:col-span-2'} bg-primary-soft border border-primary/30 rounded-xl px-3.5 py-2.5 flex items-center gap-2`}>
              <span className="text-sm font-bold text-primary-active whitespace-nowrap">{draftKind === 'trip' ? t('dg_price_per_kg') : t('dg_reward_label')}</span>
              <select value={fCurrency} onChange={e => setFCurrency(e.target.value)} className="bg-snow border border-primary/30 rounded-lg px-1.5 py-1 text-sm font-bold text-primary-active focus:outline-none cursor-pointer">
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input value={fPrice} onChange={e => setFPrice(e.target.value)} type="number" placeholder={draftKind === 'trip' ? '80' : '120'} className="flex-1 bg-transparent text-ink font-bold focus:outline-none placeholder:text-muted-soft" />
              {suggested && <span className="text-[11px] text-muted whitespace-nowrap">{t('dg_market_ref')}{fCurrency}{suggested}</span>}
            </div>

            <textarea value={fNote} onChange={e => setFNote(e.target.value)} placeholder={t('dg_ph_note')} rows={2} className="md:col-span-2 bg-surface-soft border border-hairline rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:border-primary resize-none" />
          </div>

          <div className="flex items-center justify-end gap-3 mt-4">
            <span className="text-[11px] text-muted-soft mr-auto">{t('dg_concept_note')}</span>
            <button onClick={submit} disabled={!canSubmit()} className="cta-3d px-6 py-2.5 text-sm font-semibold disabled:opacity-40 disabled:shadow-none">{t('dg_publish')}</button>
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visible.map(p => (
          <div key={p.id} className="bg-snow rounded-[28px] border border-hairline p-5 flex flex-col gap-3 hover:-translate-y-0.5 transition-transform">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-2xl bg-surface-soft flex items-center justify-center text-xl">{p.avatar}</span>
                <div className="leading-tight">
                  <div className="text-sm font-bold text-ink">{p.user}</div>
                  <div className="text-[11px] text-muted-soft">{p.kind === 'trip' ? t('dg_kind_trip') : t('dg_kind_request')}</div>
                </div>
              </div>
              {p.kind === 'trip'
                ? <span className="text-primary-active font-extrabold text-sm bg-primary-soft px-2.5 py-1 rounded-full">{p.currency || '¥'}{p.pricePerKg}/kg</span>
                : <span className="text-primary-active font-extrabold text-sm bg-primary-soft px-2.5 py-1 rounded-full">{t('dg_reward_prefix')}{p.currency || '¥'}{p.reward}</span>}
            </div>

            {p.kind === 'trip' ? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-body">
                <span className="inline-flex items-center gap-1 font-semibold text-ink"><MapPin size={14} className="text-primary" />{p.fromCity}</span>
                <span className="text-muted-soft">→</span>
                <span className="inline-flex items-center gap-1 font-semibold text-ink">{p.toCity}</span>
                <span className="inline-flex items-center gap-1 text-muted"><Calendar size={13} />{p.date}</span>
                <span className="inline-flex items-center gap-1 text-muted"><Weight size={13} />{t('dg_can_carry')}{p.kg}kg</span>
              </div>
            ) : (
              <div className="text-[14px] font-semibold text-ink flex items-start gap-1.5">
                <PackageOpen size={16} className="text-primary mt-0.5 shrink-0" />
                <span>{p.item} <span className="text-muted font-normal">· {t('dg_approx')}{p.weightKg}kg</span></span>
              </div>
            )}

            {p.note && <p className="text-[12.5px] text-muted leading-relaxed">{p.note}</p>}

            <div className="flex items-center justify-between mt-auto pt-2 border-t border-hairline-soft">
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-soft"><ShieldCheck size={13} className="text-primary" /> {t('dg_meet_advice')}</span>
              <button className="text-xs font-bold text-primary-active hover:text-ink transition-colors inline-flex items-center gap-1">
                <Sparkles size={13} /> {p.kind === 'trip' ? t('dg_find_carrier') : t('dg_i_carry')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
