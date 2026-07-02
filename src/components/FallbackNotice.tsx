// Shown whenever the server returned its clearly-labeled offline/preset fallback
// (isQuotaFallback) instead of a live Gemini result, so sample data is never
// mistaken for real AI analysis.
export default function FallbackNotice({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-amber-50 border border-amber-200/60 px-3.5 py-2.5 rounded-2xl flex items-start gap-2.5 shadow-sm ${className}`}>
      <span className="text-base leading-none shrink-0">💡</span>
      <p className="text-[10px] text-amber-900 leading-relaxed font-semibold">
        <strong className="font-black">预置示例结果（非实时 AI 分析）· Preset sample — not live AI analysis.</strong>{' '}
        当前 Gemini 接口繁忙，以下为同类场景的演示示例，并非针对您本次输入的真实结果，请稍后重试。
      </p>
    </div>
  );
}
