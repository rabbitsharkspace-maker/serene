import React from 'react';
import { Search, ExternalLink, BadgeCheck } from 'lucide-react';

export type Grounding = {
  sources?: { uri: string; title: string }[];
  queries?: string[];
  retrievedAt?: string;
};

// Shows the REAL Google Search grounding evidence behind an AI answer: the queries it ran,
// the live sources it cited (clickable), and when it checked — so anyone can verify it
// actually searched rather than answered from memory.
export default function GroundingSources({ grounding }: { grounding?: Grounding | null }) {
  if (!grounding || ((grounding.sources?.length || 0) === 0 && (grounding.queries?.length || 0) === 0)) {
    return null;
  }

  const when = grounding.retrievedAt
    ? new Date(grounding.retrievedAt).toLocaleString()
    : '';

  return (
    <div className="mt-4 bg-accent-teal/5 border border-accent-teal/25 rounded-2xl p-4">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
          <Search size={14} className="text-accent-teal" />
          AI 实时检索来源
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-accent-teal bg-accent-teal/10 rounded-full px-2 py-0.5">
          <BadgeCheck size={11} /> 已联网核查 · 非记忆
        </span>
      </div>

      {(grounding.queries?.length || 0) > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          <span className="text-[10px] text-muted-soft font-medium">检索词：</span>
          {grounding.queries!.map((q, i) => (
            <span key={i} className="text-[10px] text-body bg-surface-soft border border-hairline rounded-full px-2 py-0.5">
              {q}
            </span>
          ))}
        </div>
      )}

      {(grounding.sources?.length || 0) > 0 && (
        <ul className="space-y-1.5">
          {grounding.sources!.map((s, i) => (
            <li key={i}>
              <a
                href={s.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-ink hover:text-primary hover:underline font-medium break-all"
              >
                <ExternalLink size={12} className="shrink-0 text-muted-soft" />
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      )}

      {when && (
        <div className="text-[10px] text-muted-soft mt-2.5">🕒 检索时间：{when}</div>
      )}
    </div>
  );
}
