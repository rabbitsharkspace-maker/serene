// Ask a Photo — point the camera at anything and ask about it in your own language.
//
// Translation tells you what a sign says. Standing in front of a two-sign parking pole, that
// still isn't the question you have: you want to know whether you can park here right now. So
// this takes the photo AND the question, checks the state rule via Search grounding, and leads
// with the answer instead of an OCR dump.
import React, { useRef, useState } from 'react';
import { Camera, Loader2, AlertTriangle, X, ScanSearch } from 'lucide-react';
import { useLocale } from '../lib/locale';
import GroundingSources, { Grounding } from './GroundingSources';
import FallbackNotice from './FallbackNotice';

type AskResult = {
  answer: string;
  readsAs?: string;
  detail?: string;
  nextSteps?: string[];
  caution?: string;
  groundingSources?: Grounding | null;
  isQuotaFallback?: boolean;
};

// The questions people actually have, not feature demos. Each maps to a different photo subject
// so the prompts double as a hint about what's worth photographing.
const SUGGESTED = [
  '我现在能停这里吗？停到几点？',
  '这张单子要我做什么？有截止日期吗？',
  '这个合同条款对我不利吗？',
  '这个标志是什么意思？',
];

export default function AskPhoto() {
  const { language, country, region } = useLocale();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskResult | null>(null);
  const [error, setError] = useState('');

  const pick = (f: File | null) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      setError('照片太大了（上限 10MB），请换一张或压缩后再试。');
      return;
    }
    setError('');
    setResult(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const clear = () => {
    setFile(null);
    setPreview('');
    setResult(null);
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const ask = async () => {
    if (!file || loading) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('question', question);
      fd.append('language', language);
      fd.append('country', country);
      fd.append('region', region || '');
      const res = await fetch('/api/ask-photo', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('request failed');
      setResult(await res.json());
    } catch {
      setError('分析失败，请稍后再试。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Camera className="text-primary" size={26} />
          <h2 className="text-2xl md:text-3xl font-black text-ink">拍了就问</h2>
        </div>
        <p className="text-sm text-muted leading-relaxed">
          看不懂的路牌、账单、合同、机器界面——拍下来，用中文直接问。
          它读图回答，看不清会直说。涉及罚单、期限或申诉时，请到「信件官」——
          那里会联网核实官方来源。
        </p>
      </div>

      {/* capture 属性让手机直接开相机；桌面端退化为选文件 */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0] || null)}
      />

      {!preview ? (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full py-14 rounded-2xl border-2 border-dashed border-hairline hover:border-primary hover:bg-surface-soft transition-colors flex flex-col items-center gap-2.5"
        >
          <Camera className="text-muted-soft" size={34} />
          <span className="text-sm font-bold text-body">拍照或选择图片</span>
          <span className="text-xs text-muted-soft">路牌、罚单、合同、菜单、机器界面都可以</span>
        </button>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-hairline mb-4">
          <img src={preview} alt="待分析的照片" className="w-full max-h-72 object-contain bg-surface-soft" />
          <button
            onClick={clear}
            aria-label="移除照片"
            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-ink/70 text-on-dark hover:bg-ink transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {preview && (
        <>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={2}
            placeholder="想问什么？不填也可以，它会告诉你这是什么、该怎么办。"
            className="w-full px-4 py-3 rounded-xl border border-hairline bg-canvas text-body text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="flex flex-wrap gap-2 mt-2.5 mb-4">
            {SUGGESTED.map((q) => (
              <button
                key={q}
                onClick={() => setQuestion(q)}
                disabled={loading}
                className="px-3 py-1.5 rounded-full border border-hairline text-xs text-muted hover:border-primary hover:text-primary transition-colors disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>
          <button
            onClick={ask}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-ink text-on-dark text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={17} /> : <ScanSearch size={17} />}
            {loading ? '正在看图并核实规则…' : '问一下'}
          </button>
        </>
      )}

      {error && <div className="mt-4 p-4 rounded-xl bg-surface-soft text-sm text-muted">{error}</div>}

      {result && (
        <div className="mt-6 rounded-2xl border border-hairline bg-surface-soft p-5 md:p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {result.isQuotaFallback && <FallbackNotice className="mb-4" />}

          {/* 答案永远排第一位，OCR 结果退到下面 */}
          <div className="text-[11px] font-bold text-muted-soft tracking-wider mb-1.5">回答</div>
          <p className="text-base md:text-lg font-bold text-ink leading-relaxed mb-5">{result.answer}</p>

          {result.readsAs && (
            <div className="mb-4">
              <div className="text-[11px] font-bold text-muted-soft tracking-wider mb-1">照片上写的是</div>
              <p className="text-sm text-body leading-relaxed whitespace-pre-line">{result.readsAs}</p>
            </div>
          )}

          {result.detail && (
            <div className="mb-4">
              <div className="text-[11px] font-bold text-muted-soft tracking-wider mb-1">为什么</div>
              <p className="text-sm text-body leading-relaxed">{result.detail}</p>
            </div>
          )}

          {!!result.nextSteps?.length && (
            <div className="mb-4">
              <div className="text-[11px] font-bold text-muted-soft tracking-wider mb-1.5">接下来</div>
              <ul className="space-y-1.5">
                {result.nextSteps.map((s, i) => (
                  <li key={i} className="text-sm text-body leading-relaxed flex gap-2">
                    <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.caution && (
            <div className="mt-5 flex gap-2.5 p-3.5 rounded-xl bg-warning/10 border border-warning/30">
              <AlertTriangle className="text-warning shrink-0 mt-0.5" size={17} />
              <p className="text-sm text-body leading-relaxed">{result.caution}</p>
            </div>
          )}

          {/* 联网核实的真实来源，可点可查 */}
          <GroundingSources grounding={result.groundingSources} />
        </div>
      )}
    </div>
  );
}
