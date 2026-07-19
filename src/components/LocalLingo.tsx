// Local Lingo — decodes the everyday Australian shorthand that no textbook teaches.
//
// The gap this fills: a translator hands you the literal words and leaves you guessing at the
// situation. "Bond" translates cleanly to "押金" and still doesn't tell you it must sit with a
// government authority, not the landlord. So this returns the term AND the context it shows up in,
// and flags the handful of words where being wrong costs real money.
import React, { useState } from 'react';
import { MessageCircleQuestion, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import { useLocale } from '../lib/locale';
import FallbackNotice from './FallbackNotice';

type LingoResult = {
  term: string;
  meaning: string;
  usage: string;
  example: string;
  caution?: string;
  isQuotaFallback?: boolean;
};

// Seeded with the words newcomers hit in their first week. "Bond" and "Centrelink" are in here
// because they are the two that actually carry consequences.
// Ordered light → consequential: a greeting, then everyday shorthand, then the two words that
// cost real money if you get them wrong. Bond sits second-to-last on purpose.
const QUICK_PICKS = ["G'day", 'Arvo', 'Maccas', 'Woolies', 'Servo', 'Bottle-o', 'Bond', 'Centrelink'];

export default function LocalLingo() {
  const { language, country } = useLocale();
  const [term, setTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LingoResult | null>(null);
  const [error, setError] = useState('');

  const lookup = async (raw?: string) => {
    const q = (raw ?? term).trim();
    if (!q || loading) return;
    setTerm(q);
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/local-lingo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: q, language, country }),
      });
      if (!res.ok) throw new Error('lookup failed');
      setResult(await res.json());
    } catch {
      setError('查询失败，请稍后再试。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircleQuestion className="text-primary" size={26} />
          <h2 className="text-2xl md:text-3xl font-black text-ink">本地黑话</h2>
        </div>
        <p className="text-sm text-muted leading-relaxed">
          澳洲人日常写的词，教科书里没有。Arvo、Maccas、Woolies、bottle-o——
          翻译软件给你字面意思，但不会告诉你它出现在什么场合、有没有坑。
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && lookup()}
          placeholder="输入一个看不懂的词，例如 arvo、bond、servo"
          className="flex-1 px-4 py-3 rounded-xl border border-hairline bg-canvas text-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          onClick={() => lookup()}
          disabled={loading || !term.trim()}
          className="px-5 py-3 rounded-xl bg-ink text-on-dark text-sm font-bold disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
          查一下
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {QUICK_PICKS.map((w) => (
          <button
            key={w}
            onClick={() => lookup(w)}
            disabled={loading}
            className="px-3 py-1.5 rounded-full border border-hairline text-xs font-medium text-muted hover:border-primary hover:text-primary transition-colors disabled:opacity-40"
          >
            {w}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-surface-soft text-sm text-muted">{error}</div>
      )}

      {result && (
        <div className="rounded-2xl border border-hairline bg-surface-soft p-5 md:p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {result.isQuotaFallback && <FallbackNotice />}

          <div className="text-2xl font-black text-ink mb-1">{result.term}</div>
          <div className="text-base text-body font-semibold mb-5">{result.meaning}</div>

          {result.usage && (
            <div className="mb-4">
              <div className="text-[11px] font-bold text-muted-soft tracking-wider mb-1">什么时候会碰到</div>
              <p className="text-sm text-body leading-relaxed">{result.usage}</p>
            </div>
          )}

          {result.example && (
            <div className="mb-4">
              <div className="text-[11px] font-bold text-muted-soft tracking-wider mb-1">例句</div>
              <p className="text-sm text-body leading-relaxed italic">{result.example}</p>
            </div>
          )}

          {/* Only rendered when the model judged that getting this word wrong has a real cost. */}
          {result.caution && (
            <div className="mt-5 flex gap-2.5 p-3.5 rounded-xl bg-warning/10 border border-warning/30">
              <AlertTriangle className="text-warning shrink-0 mt-0.5" size={17} />
              <p className="text-sm text-body leading-relaxed">{result.caution}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
