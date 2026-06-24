import React, { useState, useEffect, useMemo } from 'react';
import { Plane, PackageOpen, Plus, MapPin, Calendar, Weight, ShieldCheck, Sparkles, X } from 'lucide-react';

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

const DEFAULT_POSTS: DaigouPost[] = [
  { id: 't1', kind: 'trip', user: '墨尔本学姐 Yuki', avatar: '🧳', fromCity: '上海 浦东', toCity: '墨尔本 Tullamarine', date: '7月12日', kg: 8, pricePerKg: 80, currency: '¥', note: '可带零食/常用药/数码配件，不带液体与违禁品。机场或 city 当面交付。', createdAt: Date.now() - 3600_000 },
  { id: 't2', kind: 'trip', user: '在悉尼的 Leo', avatar: '✈️', fromCity: '北京 首都', toCity: '悉尼 Kingsford-Smith', date: '7月20日', kg: 5, pricePerKg: 100, currency: '¥', note: '行李额充足，优先带轻小件。落地后 UNSW 附近面交。', createdAt: Date.now() - 7200_000 },
  { id: 'r1', kind: 'request', user: '想家的 Mia', avatar: '🍜', item: '老干妈×4 + 柳州螺蛳粉×6', weightKg: 3, reward: 120, currency: '¥', note: '到墨尔本就行，Clayton/City 都方便面交。', createdAt: Date.now() - 1800_000 },
  { id: 'r2', kind: 'request', user: '新生小陈', avatar: '💊', item: '连花清瘟 + 感冒灵颗粒（常备药）', weightKg: 1, reward: 60, currency: '¥', note: '悉尼，急用，酬金可再聊。', createdAt: Date.now() - 900_000 },
];

export default function DaigouBoard() {
  const [posts, setPosts] = useState<DaigouPost[]>(() => {
    try {
      const saved = localStorage.getItem('serene_eco_daigou');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_POSTS;
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
    const base = { id: `u${Date.now()}`, user: '我', avatar: '🙋', currency: fCurrency, note: fNote.trim(), createdAt: Date.now() };
    const post: DaigouPost = draftKind === 'trip'
      ? { ...base, kind: 'trip', fromCity: fFrom.trim(), toCity: fTo.trim(), date: fDate.trim() || '待定', kg: parseFloat(fKg), pricePerKg: parseFloat(fPrice) }
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
            <Plane size={14} /> 代购带货 · 人肉快递
          </span>
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-[11px] font-bold">🧪 概念预览</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight mb-2">从国内带点家的味道过来</h2>
        <p className="text-sm text-muted leading-relaxed max-w-2xl">
          回国 / 来澳的同学手里总有空余行李额；想家的你总缺一口老干妈、一盒常备药。把两端对上——
          <strong className="text-ink">带多少、收多少，价格你自己定</strong>，平台只帮你撮合与提示行情。
        </p>
      </div>

      {/* Filter + publish */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex bg-surface-soft rounded-full p-1">
          {([['all', `全部 ${tripCount + reqCount}`], ['trip', `🧳 带货行程 ${tripCount}`], ['request', `🙋 求带需求 ${reqCount}`]] as const).map(([k, label]) => (
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
          <Plus size={16} /> 发布一条
        </button>
      </div>

      {/* Publish form */}
      {showForm && (
        <div className="bg-snow rounded-[28px] border border-hairline p-6 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex bg-surface-soft rounded-full p-1">
              <button onClick={() => setDraftKind('trip')} className={`px-4 py-1.5 rounded-full text-xs font-bold ${draftKind === 'trip' ? 'bg-primary text-on-primary' : 'text-muted'}`}>🧳 我能带货</button>
              <button onClick={() => setDraftKind('request')} className={`px-4 py-1.5 rounded-full text-xs font-bold ${draftKind === 'request' ? 'bg-primary text-on-primary' : 'text-muted'}`}>🙋 我想要东西</button>
            </div>
            <button onClick={() => setShowForm(false)} className="text-muted hover:text-ink"><X size={18} /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {draftKind === 'trip' ? (
              <>
                <input value={fFrom} onChange={e => setFFrom(e.target.value)} placeholder="出发城市（如 上海 浦东）" className="bg-surface-soft border border-hairline rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:border-primary" />
                <input value={fTo} onChange={e => setFTo(e.target.value)} placeholder="到达城市（如 墨尔本）" className="bg-surface-soft border border-hairline rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:border-primary" />
                <input value={fDate} onChange={e => setFDate(e.target.value)} placeholder="出发日期（如 7月12日）" className="bg-surface-soft border border-hairline rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:border-primary" />
                <input value={fKg} onChange={e => setFKg(e.target.value)} type="number" placeholder="可带重量（kg）" className="bg-surface-soft border border-hairline rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:border-primary" />
              </>
            ) : (
              <>
                <input value={fItem} onChange={e => setFItem(e.target.value)} placeholder="想要什么（如 老干妈×4 + 螺蛳粉）" className="md:col-span-2 bg-surface-soft border border-hairline rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:border-primary" />
                <input value={fWeight} onChange={e => setFWeight(e.target.value)} type="number" placeholder="预估重量（kg）" className="bg-surface-soft border border-hairline rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:border-primary" />
              </>
            )}

            {/* The star field: user sets their own price AND their own currency */}
            <div className={`${draftKind === 'request' ? '' : 'md:col-span-2'} bg-primary-soft border border-primary/30 rounded-xl px-3.5 py-2.5 flex items-center gap-2`}>
              <span className="text-sm font-bold text-primary-active whitespace-nowrap">{draftKind === 'trip' ? '你定每公斤价' : '你愿付酬金'}</span>
              <select value={fCurrency} onChange={e => setFCurrency(e.target.value)} className="bg-snow border border-primary/30 rounded-lg px-1.5 py-1 text-sm font-bold text-primary-active focus:outline-none cursor-pointer">
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input value={fPrice} onChange={e => setFPrice(e.target.value)} type="number" placeholder={draftKind === 'trip' ? '80' : '120'} className="flex-1 bg-transparent text-ink font-bold focus:outline-none placeholder:text-muted-soft" />
              {suggested && <span className="text-[11px] text-muted whitespace-nowrap">行情参考 {fCurrency}{suggested}</span>}
            </div>

            <textarea value={fNote} onChange={e => setFNote(e.target.value)} placeholder="备注：交付地点、不带违禁品/液体等" rows={2} className="md:col-span-2 bg-surface-soft border border-hairline rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:border-primary resize-none" />
          </div>

          <div className="flex items-center justify-end gap-3 mt-4">
            <span className="text-[11px] text-muted-soft mr-auto">⚠️ 概念演示：仅本地保存，不涉及真实资金或真实交易</span>
            <button onClick={submit} disabled={!canSubmit()} className="cta-3d px-6 py-2.5 text-sm font-semibold disabled:opacity-40 disabled:shadow-none">发布</button>
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
                  <div className="text-[11px] text-muted-soft">{p.kind === 'trip' ? '带货行程' : '求带需求'}</div>
                </div>
              </div>
              {p.kind === 'trip'
                ? <span className="text-primary-active font-extrabold text-sm bg-primary-soft px-2.5 py-1 rounded-full">{p.currency || '¥'}{p.pricePerKg}/kg</span>
                : <span className="text-primary-active font-extrabold text-sm bg-primary-soft px-2.5 py-1 rounded-full">酬金 {p.currency || '¥'}{p.reward}</span>}
            </div>

            {p.kind === 'trip' ? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-body">
                <span className="inline-flex items-center gap-1 font-semibold text-ink"><MapPin size={14} className="text-primary" />{p.fromCity}</span>
                <span className="text-muted-soft">→</span>
                <span className="inline-flex items-center gap-1 font-semibold text-ink">{p.toCity}</span>
                <span className="inline-flex items-center gap-1 text-muted"><Calendar size={13} />{p.date}</span>
                <span className="inline-flex items-center gap-1 text-muted"><Weight size={13} />可带 {p.kg}kg</span>
              </div>
            ) : (
              <div className="text-[14px] font-semibold text-ink flex items-start gap-1.5">
                <PackageOpen size={16} className="text-primary mt-0.5 shrink-0" />
                <span>{p.item} <span className="text-muted font-normal">· 约 {p.weightKg}kg</span></span>
              </div>
            )}

            {p.note && <p className="text-[12.5px] text-muted leading-relaxed">{p.note}</p>}

            <div className="flex items-center justify-between mt-auto pt-2 border-t border-hairline-soft">
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-soft"><ShieldCheck size={13} className="text-primary" /> 建议当面交付 · 见面验货</span>
              <button className="text-xs font-bold text-primary-active hover:text-ink transition-colors inline-flex items-center gap-1">
                <Sparkles size={13} /> {p.kind === 'trip' ? '找TA带' : '我来带'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
