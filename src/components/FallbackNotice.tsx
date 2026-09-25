import { useL } from '../lib/i18n';

// Shown whenever the server returned its clearly-labeled offline/preset fallback
// (isQuotaFallback) instead of a live Gemini result, so sample data is never
// mistaken for real AI analysis.
export default function FallbackNotice({ className = '' }: { className?: string }) {
  const L = useL();
  return (
    <div className={`bg-amber-50 border border-amber-200/60 px-3.5 py-2.5 rounded-2xl flex items-start gap-2.5 shadow-sm ${className}`}>
      <span className="text-base leading-none shrink-0">💡</span>
      <p className="text-[10px] text-amber-900 leading-relaxed font-semibold">
        <strong className="font-black">{L({
          zh: '预置示例结果（非实时 AI 分析）· Preset sample — not live AI analysis.',
          en: 'Preset sample — not live AI analysis.',
          es: 'Resultado de ejemplo predefinido: no es un análisis de IA en directo.',
          hi: 'पहले से तैयार नमूना परिणाम — लाइव AI विश्लेषण नहीं।',
          vi: 'Kết quả mẫu cài sẵn — không phải phân tích AI trực tiếp.',
          ar: 'نتيجة نموذجية معدّة مسبقًا — ليست تحليلًا مباشرًا بالذكاء الاصطناعي.',
        })}</strong>{' '}
        {L({
          zh: '当前 Gemini 接口繁忙，以下为同类场景的演示示例，并非针对您本次输入的真实结果，请稍后重试。',
          en: 'Gemini is busy right now. Below is a demo example of a similar scenario, not a real result for your input. Please try again later.',
          es: 'Gemini está saturado en este momento. A continuación verás un ejemplo de un caso similar, no un resultado real para tu entrada. Inténtalo de nuevo más tarde.',
          hi: 'Gemini अभी व्यस्त है। नीचे मिलते-जुलते मामले का डेमो उदाहरण है, आपके इनपुट का वास्तविक परिणाम नहीं। कृपया बाद में पुनः प्रयास करें।',
          vi: 'Gemini hiện đang bận. Dưới đây là ví dụ minh họa cho tình huống tương tự, không phải kết quả thật cho nội dung bạn nhập. Vui lòng thử lại sau.',
          ar: 'Gemini مشغول حاليًا. فيما يلي مثال توضيحي لحالة مشابهة، وليس نتيجة حقيقية لما أدخلته. يُرجى المحاولة لاحقًا.',
        })}
      </p>
    </div>
  );
}
