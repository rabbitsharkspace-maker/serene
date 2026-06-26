import React, { useState, useRef } from 'react';
import { Camera, Languages, ArrowRightLeft, Loader2, Copy, Check } from 'lucide-react';
import { useLocale, getCountryContent } from '../lib/locale';
import { useT } from '../lib/i18n';
import GroundingSources, { Grounding } from './GroundingSources';

// Likely "home" currency by the user's chosen language (immigrant source).
const HOME_CCY: Record<string, string> = {
  zh: 'CNY', es: 'MXN', hi: 'INR', vi: 'VND', ar: 'AED', en: 'USD',
};
const CCY_OPTIONS = ['USD', 'AUD', 'GBP', 'CAD', 'EUR', 'CNY', 'INR', 'VND', 'MXN', 'AED', 'JPY', 'KRW'];

type PhotoResult = {
  detectedLanguage?: string;
  originalText?: string;
  translation?: string;
  note?: string;
};

export default function EcoTools() {
  const { country, language } = useLocale();
  const t = useT();
  const content = getCountryContent(country);

  // --- Photo translate ---
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [photoResult, setPhotoResult] = useState<PhotoResult | null>(null);
  const [photoError, setPhotoError] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setPhotoResult(null);
    setPhotoError(false);
  };

  const runTranslate = async () => {
    if (!file) return;
    setTranslating(true);
    setPhotoResult(null);
    setPhotoError(false);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('language', language);
      const res = await fetch('/api/photo-translate', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('failed');
      setPhotoResult(await res.json());
    } catch {
      setPhotoError(true);
    } finally {
      setTranslating(false);
    }
  };

  const copyTranslation = () => {
    if (!photoResult?.translation) return;
    navigator.clipboard.writeText(photoResult.translation);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // --- Exchange rate ---
  const [amount, setAmount] = useState('100');
  const [fromCcy, setFromCcy] = useState(content.currencyCode);
  const [toCcy, setToCcy] = useState(HOME_CCY[language] || 'USD');
  const [rate, setRate] = useState<number | null>(null);
  const [asOf, setAsOf] = useState<string>('');
  const [fxGrounding, setFxGrounding] = useState<Grounding | null>(null);
  const [fxLoading, setFxLoading] = useState(false);
  const [fxError, setFxError] = useState(false);

  const fetchRate = async () => {
    setFxLoading(true);
    setFxError(false);
    setRate(null);
    try {
      const res = await fetch('/api/exchange-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: fromCcy, to: toCcy }),
      });
      if (!res.ok) throw new Error('failed');
      const d = await res.json();
      setRate(d.rate);
      setAsOf(d.asOf || '');
      setFxGrounding(d._grounding || null);
    } catch {
      setFxError(true);
    } finally {
      setFxLoading(false);
    }
  };

  const converted = rate != null ? (Number(amount) || 0) * rate : null;

  const swap = () => {
    setFromCcy(toCcy);
    setToCcy(fromCcy);
    setRate(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Photo translate */}
      <div className="bg-white border border-hairline rounded-3xl p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Languages size={18} /></span>
          <h3 className="font-display text-xl text-ink">{t('et_photo_title')}</h3>
        </div>
        <p className="text-xs text-muted mb-4">{t('et_photo_desc')}</p>

        <input type="file" accept="image/*" ref={fileInputRef} onChange={onPick} className="hidden" />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-[4/3] rounded-2xl border border-dashed border-hairline bg-surface-soft hover:border-primary transition-all flex flex-col items-center justify-center overflow-hidden mb-3"
        >
          {preview ? (
            <img src={preview} alt="preview" className="w-full h-full object-contain" />
          ) : (
            <span className="flex flex-col items-center text-muted-soft">
              <Camera size={28} className="mb-2" />
              <span className="text-xs font-medium">{t('et_photo_pick')}</span>
            </span>
          )}
        </button>

        <button
          onClick={runTranslate}
          disabled={!file || translating}
          className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${file && !translating ? 'bg-primary hover:bg-primary-active text-on-primary' : 'bg-surface-strong text-muted-soft cursor-not-allowed'}`}
        >
          {translating ? <><Loader2 size={16} className="animate-spin" /> {t('et_photo_translating')}</> : <>{t('et_photo_translate_btn')}</>}
        </button>

        {photoError && <p className="text-xs text-error mt-3">{t('et_photo_fail')}</p>}

        {photoResult && (
          <div className="mt-4 space-y-3 animate-in fade-in duration-300">
            {photoResult.detectedLanguage && (
              <span className="inline-block text-[11px] font-semibold text-muted bg-surface-soft border border-hairline rounded-full px-2.5 py-1">
                {t('et_photo_detected')}{photoResult.detectedLanguage}
              </span>
            )}
            {photoResult.originalText && (
              <div>
                <div className="text-[10px] font-bold text-muted-soft uppercase tracking-wider mb-1">{t('et_photo_original')}</div>
                <p className="text-xs text-body bg-surface-soft rounded-xl p-3 leading-relaxed whitespace-pre-wrap">{photoResult.originalText}</p>
              </div>
            )}
            {photoResult.translation && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[10px] font-bold text-primary uppercase tracking-wider">{t('et_photo_translation')}</div>
                  <button onClick={copyTranslation} className="text-[10px] font-bold text-muted hover:text-ink flex items-center gap-1">
                    {copied ? <><Check size={12} /> {t('et_copied')}</> : <><Copy size={12} /> {t('et_copy')}</>}
                  </button>
                </div>
                <p className="text-sm text-ink bg-primary/5 border border-primary/15 rounded-xl p-3 leading-relaxed whitespace-pre-wrap">{photoResult.translation}</p>
              </div>
            )}
            {photoResult.note && (
              <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-100 rounded-xl p-2.5">💡 {photoResult.note}</p>
            )}
          </div>
        )}
      </div>

      {/* Exchange rate */}
      <div className="bg-white border border-hairline rounded-3xl p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-8 h-8 rounded-xl bg-accent-teal/15 text-accent-teal flex items-center justify-center"><ArrowRightLeft size={18} /></span>
          <h3 className="font-display text-xl text-ink">{t('et_fx_title')}</h3>
        </div>
        <p className="text-xs text-muted mb-4">{t('et_fx_desc')}</p>

        <label className="text-[10px] font-bold text-muted-soft uppercase tracking-wider mb-1.5">{t('et_fx_amount')}</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-surface-soft border border-hairline rounded-xl px-3.5 py-2.5 text-sm text-ink mb-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />

        <div className="flex items-end gap-2 mb-4">
          <div className="flex-1">
            <label className="text-[10px] font-bold text-muted-soft uppercase tracking-wider mb-1.5 block">{t('et_fx_from')}</label>
            <select value={fromCcy} onChange={(e) => { setFromCcy(e.target.value); setRate(null); }} className="w-full bg-surface-soft border border-hairline rounded-xl px-3 py-2.5 text-sm font-semibold text-ink cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40">
              {CCY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={swap} title={t('et_fx_swap')} className="mb-1 w-10 h-10 shrink-0 rounded-xl bg-surface-soft border border-hairline text-muted hover:text-primary hover:border-primary flex items-center justify-center">
            <ArrowRightLeft size={16} />
          </button>
          <div className="flex-1">
            <label className="text-[10px] font-bold text-muted-soft uppercase tracking-wider mb-1.5 block">{t('et_fx_to')}</label>
            <select value={toCcy} onChange={(e) => { setToCcy(e.target.value); setRate(null); }} className="w-full bg-surface-soft border border-hairline rounded-xl px-3 py-2.5 text-sm font-semibold text-ink cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40">
              {CCY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={fetchRate}
          disabled={fxLoading}
          className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${!fxLoading ? 'bg-ink hover:bg-black text-on-dark' : 'bg-surface-strong text-muted-soft cursor-not-allowed'}`}
        >
          {fxLoading ? <><Loader2 size={16} className="animate-spin" /> {t('et_fx_querying')}</> : <>{t('et_fx_query_btn')}</>}
        </button>

        {fxError && <p className="text-xs text-error mt-3">{t('et_fx_fail')}</p>}

        {converted != null && (
          <div className="mt-4 bg-surface-soft border border-hairline rounded-2xl p-5 text-center animate-in fade-in duration-300">
            <div className="text-3xl font-display text-ink">
              {converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-lg text-muted">{toCcy}</span>
            </div>
            <div className="text-xs text-muted mt-1.5">
              {amount} {fromCcy} ≈ {t('et_fx_above_amount')}　·　1 {fromCcy} = {rate?.toLocaleString(undefined, { maximumFractionDigits: 4 })} {toCcy}
            </div>
            {asOf && <div className="text-[10px] text-muted-soft mt-1">🔎 {t('et_fx_as_of')}{asOf}</div>}
          </div>
        )}

        {converted != null && <GroundingSources grounding={fxGrounding} />}
      </div>
    </div>
  );
}
