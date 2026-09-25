import React from 'react';
import { Camera, Search, ListChecks, Mail, Check, ChevronDown, Sparkles, Database, ExternalLink } from 'lucide-react';
import { useL, Localized } from '../lib/i18n';

const FLOW: { icon: typeof Camera; n: string; title: Localized; detail: Localized }[] = [
  { icon: Camera, n: '01',
    title: { zh: '拍下公文', en: 'Snap the letter', es: 'Fotografía la carta', hi: 'पत्र की फ़ोटो लें', vi: 'Chụp lá thư', ar: 'صوّر الرسالة' },
    detail: { zh: '罚单、Show Cause、押金通知', en: 'Fines, Show Cause, bond notices', es: 'Multas, Show Cause, avisos de fianza', hi: 'जुर्माने, Show Cause, बॉन्ड नोटिस', vi: 'Giấy phạt, Show Cause, thông báo tiền cọc', ar: 'مخالفات، Show Cause، إشعارات الوديعة' } },
  { icon: Sparkles, n: '02',
    title: { zh: 'Gemini 读懂', en: 'Gemini reads it', es: 'Gemini la entiende', hi: 'Gemini इसे पढ़ता है', vi: 'Gemini đọc hiểu', ar: 'Gemini يقرؤها' },
    detail: { zh: '多模态识别事实、金额与期限', en: 'Multimodal extraction of facts, amounts and deadlines', es: 'Extracción multimodal de hechos, importes y plazos', hi: 'तथ्यों, राशियों और समय-सीमाओं की मल्टीमॉडल पहचान', vi: 'Trích xuất đa phương thức dữ kiện, số tiền và thời hạn', ar: 'استخراج متعدد الوسائط للوقائع والمبالغ والمواعيد النهائية' } },
  { icon: Search, n: '03',
    title: { zh: '核验依据', en: 'Verify the basis', es: 'Verifica el fundamento', hi: 'आधार की पुष्टि', vi: 'Kiểm chứng căn cứ', ar: 'تحقّق من الأساس' },
    detail: { zh: 'Google Search Grounding 检索官方来源', en: 'Google Search Grounding finds official sources', es: 'Google Search Grounding busca fuentes oficiales', hi: 'Google Search Grounding आधिकारिक स्रोत खोजता है', vi: 'Google Search Grounding tìm nguồn chính thức', ar: 'Google Search Grounding يبحث عن المصادر الرسمية' } },
  { icon: ListChecks, n: '04',
    title: { zh: '生成行动', en: 'Plan the action', es: 'Planifica la acción', hi: 'कार्रवाई की योजना', vi: 'Lập kế hoạch hành động', ar: 'خطّط للإجراء' },
    detail: { zh: '风险、权利、材料与下一步', en: 'Risks, rights, documents and next steps', es: 'Riesgos, derechos, documentos y próximos pasos', hi: 'जोखिम, अधिकार, दस्तावेज़ और अगले कदम', vi: 'Rủi ro, quyền lợi, giấy tờ và bước tiếp theo', ar: 'المخاطر والحقوق والمستندات والخطوات التالية' } },
  { icon: Mail, n: '05',
    title: { zh: '发起申诉', en: 'Lodge an appeal', es: 'Presenta un recurso', hi: 'अपील दर्ज करें', vi: 'Nộp đơn khiếu nại', ar: 'قدّم اعتراضًا' },
    detail: { zh: '英文草稿保存到 Gmail', en: 'English draft saved to Gmail', es: 'Borrador en inglés guardado en Gmail', hi: 'अंग्रेज़ी ड्राफ़्ट Gmail में सहेजा जाता है', vi: 'Bản nháp tiếng Anh lưu vào Gmail', ar: 'مسودة بالإنجليزية تُحفظ في Gmail' } },
];

const PERSONAS: { flag: string; name: Localized; context: Localized; case: Localized; expected: Localized }[] = [
  { flag: '🇨🇳',
    name: { zh: '林同学', en: 'Lin', es: 'Lin', hi: 'Lin', vi: 'Lin', ar: 'Lin' },
    context: { zh: '新留学生 · 中文', en: 'New international student · Chinese', es: 'Estudiante internacional recién llegado · chino', hi: 'नया अंतरराष्ट्रीय छात्र · चीनी', vi: 'Du học sinh mới · tiếng Trung', ar: 'طالب دولي جديد · الصينية' },
    case: { zh: '停车罚单', en: 'Parking fine', es: 'Multa de aparcamiento', hi: 'पार्किंग जुर्माना', vi: 'Phạt đỗ xe', ar: 'مخالفة وقوف' },
    expected: { zh: '识别金额与期限；只引用 VIC 官方复核入口', en: 'Extracts amount and deadline; cites only the official VIC review channel', es: 'Extrae importe y plazo; cita solo la vía oficial de revisión de VIC', hi: 'राशि और समय-सीमा निकालता है; केवल VIC की आधिकारिक समीक्षा प्रक्रिया का हवाला देता है', vi: 'Trích xuất số tiền và thời hạn; chỉ dẫn kênh xem xét lại chính thức của VIC', ar: 'يستخرج المبلغ والموعد النهائي؛ ولا يستشهد إلا بقناة المراجعة الرسمية في VIC' } },
  { flag: '🇪🇸',
    name: { zh: 'Ana', en: 'Ana', es: 'Ana', hi: 'Ana', vi: 'Ana', ar: 'Ana' },
    context: { zh: 'Working Holiday · Español', en: 'Working Holiday · Español', es: 'Working Holiday · Español', hi: 'Working Holiday · Español', vi: 'Working Holiday · Español', ar: 'Working Holiday · Español' },
    case: { zh: '租房押金', en: 'Rental bond', es: 'Fianza del alquiler', hi: 'किराये की जमा राशि (बॉन्ड)', vi: 'Tiền cọc thuê nhà', ar: 'وديعة الإيجار' },
    expected: { zh: '西语解释；区分合理磨损与待核实损坏', en: 'Explains in Spanish; separates fair wear and tear from damage to be verified', es: 'Explica en español; distingue el desgaste normal de los daños por verificar', hi: 'स्पेनिश में समझाता है; सामान्य टूट-फूट को जाँच-योग्य नुकसान से अलग करता है', vi: 'Giải thích bằng tiếng Tây Ban Nha; phân biệt hao mòn hợp lý với hư hỏng cần xác minh', ar: 'يشرح بالإسبانية؛ ويميّز الاهتراء الطبيعي عن الأضرار التي تحتاج إلى تحقق' } },
  { flag: '🇻🇳',
    name: { zh: 'Minh', en: 'Minh', es: 'Minh', hi: 'Minh', vi: 'Minh', ar: 'Minh' },
    context: { zh: '技术新移民 · Tiếng Việt', en: 'Skilled migrant · Tiếng Việt', es: 'Migrante cualificado · Tiếng Việt', hi: 'कुशल प्रवासी · Tiếng Việt', vi: 'Di dân tay nghề · Tiếng Việt', ar: 'مهاجر ماهر · Tiếng Việt' },
    case: { zh: '劳动合同', en: 'Employment contract', es: 'Contrato laboral', hi: 'रोज़गार अनुबंध', vi: 'Hợp đồng lao động', ar: 'عقد عمل' },
    expected: { zh: '越语解释关键条款；引导至 Fair Work 官方渠道', en: 'Explains key clauses in Vietnamese; points to official Fair Work channels', es: 'Explica las cláusulas clave en vietnamita; remite a los canales oficiales de Fair Work', hi: 'मुख्य शर्तें वियतनामी में समझाता है; Fair Work के आधिकारिक माध्यमों तक पहुँचाता है', vi: 'Giải thích điều khoản chính bằng tiếng Việt; hướng tới kênh chính thức của Fair Work', ar: 'يشرح البنود الرئيسية بالفيتنامية؛ ويوجّه إلى قنوات Fair Work الرسمية' } },
  { flag: '🇮🇳',
    name: { zh: 'Asha', en: 'Asha', es: 'Asha', hi: 'Asha', vi: 'Asha', ar: 'Asha' },
    context: { zh: '陪读家庭 · हिन्दी', en: 'Accompanying family · हिन्दी', es: 'Familia acompañante · हिन्दी', hi: 'साथ आया परिवार · हिन्दी', vi: 'Gia đình đi cùng · हिन्दी', ar: 'عائلة مرافقة · हिन्दी' },
    case: { zh: '水电催缴', en: 'Utility overdue notice', es: 'Aviso de recibo de suministros vencido', hi: 'बिजली-पानी बिल बकाया नोटिस', vi: 'Thông báo nợ tiền điện nước', ar: 'إشعار متأخرات فواتير الخدمات' },
    expected: { zh: '印地语说明；给出 hardship 与 EWOV 官方路径', en: 'Explains in Hindi; gives official hardship and EWOV pathways', es: 'Explica en hindi; indica las vías oficiales de hardship y EWOV', hi: 'हिन्दी में समझाता है; hardship और EWOV के आधिकारिक रास्ते बताता है', vi: 'Giải thích bằng tiếng Hindi; chỉ ra lộ trình chính thức về hardship và EWOV', ar: 'يشرح بالهندية؛ ويقدّم المسارات الرسمية لـ hardship وEWOV' } },
  { flag: '🇸🇦',
    name: { zh: 'Noor', en: 'Noor', es: 'Noor', hi: 'Noor', vi: 'Noor', ar: 'Noor' },
    context: { zh: '外派新居民 · العربية', en: 'Expat newcomer · العربية', es: 'Expatriada recién llegada · العربية', hi: 'विदेश से आई नई निवासी · العربية', vi: 'Người nước ngoài mới đến · العربية', ar: 'مغتربة وافدة جديدة · العربية' },
    case: { zh: '可疑催款', en: 'Suspicious debt demand', es: 'Reclamación de deuda sospechosa', hi: 'संदिग्ध वसूली माँग', vi: 'Đòi nợ đáng ngờ', ar: 'مطالبة دين مشبوهة' },
    expected: { zh: '阿语风险提示；不把模型判断表述为最终裁决', en: 'Flags risks in Arabic; never presents the model\'s judgement as a final ruling', es: 'Señala los riesgos en árabe; nunca presenta el juicio del modelo como una resolución definitiva', hi: 'अरबी में जोखिम बताता है; मॉडल के आकलन को कभी अंतिम फ़ैसले के रूप में पेश नहीं करता', vi: 'Cảnh báo rủi ro bằng tiếng Ả Rập; không bao giờ trình bày đánh giá của mô hình như phán quyết cuối cùng', ar: 'ينبّه إلى المخاطر بالعربية؛ ولا يقدّم تقدير النموذج أبدًا على أنه حكم نهائي' } },
];

export default function JudgingProof() {
  const L = useL();
  return (
    <section className="mb-8 space-y-3" aria-label={L({ zh: 'Serene 核心能力与验证证据', en: 'Serene core capabilities and validation evidence', es: 'Capacidades clave de Serene y evidencia de validación', hi: 'Serene की मुख्य क्षमताएँ और सत्यापन के साक्ष्य', vi: 'Năng lực cốt lõi của Serene và bằng chứng kiểm chứng', ar: 'قدرات Serene الأساسية وأدلة التحقق' })}>
      <div className="overflow-hidden rounded-3xl border border-hairline bg-surface-card shadow-sm">
        <div className="flex flex-col gap-4 border-b border-hairline px-5 py-5 md:flex-row md:items-end md:justify-between md:px-6">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-bold tracking-[.12em] text-primary">
              <Sparkles size={12} /> {L({ zh: 'ONE HERO JOURNEY', en: 'ONE HERO JOURNEY', es: 'UN RECORRIDO CLAVE', hi: 'एक मुख्य यात्रा', vi: 'MỘT HÀNH TRÌNH CỐT LÕI', ar: 'رحلة رئيسية واحدة' })}
            </div>
            <h3 className="text-xl font-bold text-ink md:text-2xl">{L({ zh: '一封看不懂的信，五步变成可执行的下一步', en: 'One confusing letter, five steps to a clear next move', es: 'Una carta confusa, cinco pasos hasta saber qué hacer', hi: 'एक उलझन भरा पत्र, पाँच कदमों में साफ़ अगला कदम', vi: 'Một lá thư khó hiểu, năm bước để biết rõ cần làm gì tiếp', ar: 'رسالة محيّرة، وخمس خطوات لتعرف خطوتك التالية بوضوح' })}</h3>
          </div>
          <p className="max-w-sm text-xs leading-5 text-muted">{L({ zh: '路演只演示这一条核心链路；生活圈与社区能力作为后续扩展，不参与主叙事。', en: 'The demo focuses on this one core flow; lifestyle and community features are later extensions, not part of the main story.', es: 'La demo se centra en este único flujo principal; las funciones de vida diaria y comunidad son ampliaciones posteriores, fuera de la historia principal.', hi: 'डेमो केवल इसी मुख्य प्रवाह पर केंद्रित है; जीवनशैली और समुदाय सुविधाएँ बाद के विस्तार हैं, मुख्य कहानी का हिस्सा नहीं।', vi: 'Bản demo chỉ tập trung vào luồng cốt lõi này; các tính năng đời sống và cộng đồng là phần mở rộng sau, không thuộc câu chuyện chính.', ar: 'يركّز العرض على هذا المسار الأساسي وحده؛ أما ميزات الحياة اليومية والمجتمع فهي توسعات لاحقة وليست جزءًا من القصة الرئيسية.' })}</p>
        </div>

        <div className="grid md:grid-cols-5">
          {FLOW.map(({ icon: Icon, n, title, detail }, index) => (
            <div key={n} className={`relative px-5 py-4 ${index < FLOW.length - 1 ? 'border-b border-hairline md:border-b-0 md:border-r' : ''}`}>
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-muted-soft">{n}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-soft text-ink"><Icon size={16}/></span>
              </div>
              <p className="text-sm font-bold text-ink">{L(title)}</p>
              <p className="mt-1 text-[11px] leading-4 text-muted">{L(detail)}</p>
            </div>
          ))}
        </div>

        <div className="grid border-t border-hairline bg-surface-soft/55 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
          <div className="px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-soft">{L({ zh: 'Input', en: 'Input', es: 'Entrada', hi: 'इनपुट', vi: 'Đầu vào', ar: 'المدخلات' })}</p>
            <p className="mt-1 text-xs font-semibold text-ink">{L({ zh: '图片 + 签证 / 学校 / 州别上下文', en: 'Photo + visa / school / state context', es: 'Foto + contexto de visado / centro de estudios / estado', hi: 'फ़ोटो + वीज़ा / स्कूल / राज्य का संदर्भ', vi: 'Ảnh + bối cảnh visa / trường / bang', ar: 'صورة + سياق التأشيرة / المدرسة / الولاية' })}</p>
          </div>
          <span className="hidden text-muted-soft lg:block">→</span>
          <div className="border-y border-hairline px-5 py-4 lg:border-x lg:border-y-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-soft">Google AI Core</p>
            <p className="mt-1 text-xs font-semibold text-ink">Gemini Vision + Search Grounding</p>
          </div>
          <span className="hidden text-muted-soft lg:block">→</span>
          <div className="px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-soft">{L({ zh: 'Action', en: 'Action', es: 'Acción', hi: 'कार्रवाई', vi: 'Hành động', ar: 'الإجراء' })}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-ink"><Database size={13}/> {L({ zh: 'Firebase 案头 + Gmail 草稿', en: 'Firebase My Desk + Gmail draft', es: 'Mi escritorio en Firebase + borrador de Gmail', hi: 'Firebase मेरा डेस्क + Gmail ड्राफ़्ट', vi: 'Bàn của tôi trên Firebase + bản nháp Gmail', ar: 'مكتبي على Firebase + مسودة Gmail' })}</p>
          </div>
        </div>
      </div>

      <details className="group overflow-hidden rounded-2xl border border-hairline bg-surface-card">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-soft text-ink"><Check size={17}/></span>
            <div>
              <p className="text-sm font-bold text-ink">{L({ zh: '5 个模拟澳洲新居民情境测试', en: '5 simulated newcomer scenario tests in Australia', es: '5 pruebas con escenarios simulados de recién llegados a Australia', hi: 'ऑस्ट्रेलिया में नए निवासियों के 5 सिम्युलेटेड परिदृश्य परीक्षण', vi: '5 bài kiểm thử tình huống mô phỏng người mới đến Úc', ar: '5 اختبارات لسيناريوهات محاكاة لقادمين جدد إلى أستراليا' })}</p>
              <p className="mt-0.5 text-[11px] text-muted">{L({ zh: '覆盖留学生、新移民、Working Holiday、陪读家庭与外派人员 · 可复现，不冒充访谈', en: 'Covers international students, new migrants, Working Holiday makers, accompanying families and expats · reproducible, not presented as interviews', es: 'Abarca estudiantes internacionales, nuevos migrantes, Working Holiday, familias acompañantes y expatriados · reproducibles, no se presentan como entrevistas', hi: 'अंतरराष्ट्रीय छात्र, नए प्रवासी, Working Holiday, साथ आए परिवार और विदेश से आए कर्मी शामिल · दोहराए जा सकते हैं, साक्षात्कार के रूप में पेश नहीं', vi: 'Bao gồm du học sinh, người mới nhập cư, Working Holiday, gia đình đi cùng và người nước ngoài công tác · có thể tái hiện, không trình bày như phỏng vấn', ar: 'تشمل الطلاب الدوليين والمهاجرين الجدد وحاملي Working Holiday والعائلات المرافقة والمغتربين · قابلة لإعادة التنفيذ، ولا تُقدَّم على أنها مقابلات' })}</p>
            </div>
          </div>
          <ChevronDown size={17} className="shrink-0 text-muted transition-transform group-open:rotate-180"/>
        </summary>

        <div className="border-t border-hairline px-5 py-5">
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-[11px] leading-5 text-amber-900">
            <strong>{L({ zh: '验证口径：', en: 'Validation scope: ', es: 'Alcance de la validación: ', hi: 'सत्यापन का दायरा: ', vi: 'Phạm vi kiểm chứng: ', ar: 'نطاق التحقق: ' })}</strong>
            {L({
              zh: '以下为 Synthetic Scenario Testing（模拟情境测试），用于覆盖边界条件，不代表已采访这些人物。创作者本人有留学与海外落地经历，产品问题来自亲身处境观察；真实新居民访谈将在下一阶段补充。',
              en: 'These are Synthetic Scenario Tests designed to cover edge cases; they do not represent interviews with these people. The creator has studied and settled overseas, and the product problems come from first-hand experience; real newcomer interviews will follow in the next phase.',
              es: 'Son pruebas de escenarios sintéticos (Synthetic Scenario Testing) diseñadas para cubrir casos límite; no representan entrevistas con estas personas. La persona creadora ha estudiado y se ha establecido en el extranjero, y los problemas del producto nacen de su propia experiencia; las entrevistas con recién llegados reales llegarán en la siguiente fase.',
              hi: 'ये Synthetic Scenario Tests (सिम्युलेटेड परिदृश्य परीक्षण) हैं, जो सीमांत स्थितियों को परखने के लिए बनाए गए हैं; ये इन लोगों से किए गए साक्षात्कार नहीं हैं। निर्माता ने स्वयं विदेश में पढ़ाई की है और वहाँ बसने का अनुभव रखते हैं, और उत्पाद की समस्याएँ प्रत्यक्ष अनुभव से आई हैं; वास्तविक नए निवासियों के साक्षात्कार अगले चरण में जोड़े जाएँगे।',
              vi: 'Đây là các bài Synthetic Scenario Testing (kiểm thử tình huống mô phỏng) nhằm bao quát các trường hợp biên; chúng không phải là phỏng vấn những người này. Người tạo ra sản phẩm từng du học và định cư ở nước ngoài, các vấn đề của sản phẩm đến từ trải nghiệm thực tế; phỏng vấn người mới đến thật sẽ được bổ sung ở giai đoạn tiếp theo.',
              ar: 'هذه اختبارات سيناريوهات تركيبية (Synthetic Scenario Testing) صُمّمت لتغطية الحالات الحدّية، ولا تمثّل مقابلات مع هؤلاء الأشخاص. درس صانع المنتج في الخارج واستقر هناك، وتنبع مشكلات المنتج من تجربة شخصية مباشرة؛ وستُجرى مقابلات حقيقية مع قادمين جدد في المرحلة التالية.',
            })}
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            {PERSONAS.map((p) => (
              <article key={p.name.en} className="rounded-2xl border border-hairline bg-surface-soft/55 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg">{p.flag}</span>
                  <span className="rounded-full bg-surface-card px-2 py-0.5 text-[9px] font-bold text-muted">{L({ zh: 'SIMULATED', en: 'SIMULATED', es: 'SIMULADO', hi: 'सिम्युलेटेड', vi: 'MÔ PHỎNG', ar: 'محاكاة' })}</span>
                </div>
                <p className="mt-2 text-sm font-bold text-ink">{L(p.name)}</p>
                <p className="mt-0.5 text-[10px] text-muted">{L(p.context)}</p>
                <p className="mt-3 text-[10px] font-bold text-primary">{L({ zh: '测试：', en: 'Test: ', es: 'Prueba: ', hi: 'परीक्षण: ', vi: 'Kiểm thử: ', ar: 'الاختبار: ' })}{L(p.case)}</p>
                <p className="mt-1 text-[10px] leading-4 text-body">{L({ zh: '通过标准：', en: 'Pass criteria: ', es: 'Criterio de aprobación: ', hi: 'सफलता मानदंड: ', vi: 'Tiêu chí đạt: ', ar: 'معيار النجاح: ' })}{L(p.expected)}</p>
              </article>
            ))}
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-[10px] text-muted"><ExternalLink size={11}/> {L({ zh: '所有测试均可用页面内置案例和语言切换器现场复现。', en: 'Every test can be reproduced live with the built-in sample cases and the language switcher.', es: 'Cada prueba se puede reproducir en directo con los casos de ejemplo integrados y el selector de idioma.', hi: 'हर परीक्षण को पेज के बिल्ट-इन नमूना मामलों और भाषा स्विचर से लाइव दोहराया जा सकता है।', vi: 'Mọi bài kiểm thử đều có thể tái hiện trực tiếp bằng các ca mẫu có sẵn và bộ chuyển ngôn ngữ.', ar: 'يمكن إعادة كل اختبار مباشرةً باستخدام الحالات النموذجية المدمجة في الصفحة ومبدّل اللغة.' })}</p>
        </div>
      </details>
    </section>
  );
}
